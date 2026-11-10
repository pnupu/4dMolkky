// The playing field: twelve pins, one throwing skittle, and the judging of a throw.
//
// World axes: X and W span the two sideways directions, Y is up, and the player throws
// from +Z toward -Z. The ground is three-dimensional (X, Z, W), so the rack is a
// close-packed cluster in three ground directions, not a flat triangle.

import {
  add,
  addScaled,
  dot,
  identity,
  len,
  type Mat4,
  mulMM,
  mulMV,
  normalize,
  scale,
  sub,
  type Vec4,
  wedge,
} from "../math4";
import { type Body, World } from "../physics/world";
import { PIN_RADIUS, pinShape, skittleShape, THROW_DISTANCE } from "./equipment";

/** Centre-to-centre spacing in the rack: touching, with a hair of clearance. */
const SPACING = PIN_RADIUS * 2 * 1.03;
const ROW = (SPACING * Math.sqrt(3)) / 2;
const LAYER = SPACING * Math.sqrt(2 / 3);

/** Z of the throwing line. The front pin of the rack stands at z = ROW. */
export const LINE_Z = THROW_DISTANCE + ROW;
/** Height of the hand at release. */
export const RELEASE_HEIGHT = 0.55;

/**
 * Rack positions as [number, x, z, w]. The middle layer (w = 0) is a triangle of six
 * with pin 1 at the front. Three pins sit in its hollows on each side along W. The
 * 10, 11 and 12 pins have the most neighbours, like the centre of a classic rack.
 */
export const RACK: [number, number, number, number][] = [
  [1, 0, ROW, 0],
  [10, -SPACING / 2, 0, 0],
  [11, SPACING / 2, 0, 0],
  [2, -SPACING, -ROW, 0],
  [12, 0, -ROW, 0],
  [3, SPACING, -ROW, 0],
  [4, 0, ROW / 3, LAYER],
  [6, -SPACING / 2, (-2 * ROW) / 3, LAYER],
  [8, SPACING / 2, (-2 * ROW) / 3, LAYER],
  [5, 0, ROW / 3, -LAYER],
  [7, -SPACING / 2, (-2 * ROW) / 3, -LAYER],
  [9, SPACING / 2, (-2 * ROW) / 3, -LAYER],
];

export type PinState = "standing" | "leaning" | "fallen";

export interface Pin {
  number: number;
  body: Body;
}

export type ThrowStyle = "wide" | "deep" | "spear";

export interface ThrowInput {
  /** Rotation of the view slice in the X-W plane, radians. */
  slice: number;
  /** Aim to the side inside the slice, radians. Positive is to the right. */
  yaw: number;
  /** Launch angle above the ground, radians. */
  loft: number;
  /** Launch speed in m/s. */
  speed: number;
  style: ThrowStyle;
}

/** The sideways unit vector that is visible in the slice at angle `slice`. */
export const lateralAxis = (slice: number): Vec4 => [Math.cos(slice), 0, 0, Math.sin(slice)];
/** The unit vector at right angles to the slice: the hidden direction. */
export const hiddenAxis = (slice: number): Vec4 => [-Math.sin(slice), 0, 0, Math.cos(slice)];

export const throwDirection = (input: ThrowInput): Vec4 => {
  const side = lateralAxis(input.slice);
  const flat = addScaled(scale([0, 0, -1, 0], Math.cos(input.yaw)), side, Math.sin(input.yaw));
  return add(scale(flat, Math.cos(input.loft)), [0, Math.sin(input.loft), 0, 0]);
};

export const releasePoint = (): Vec4 => [0, RELEASE_HEIGHT, LINE_Z, 0];

/** A rotation whose second column (the shape axis) is `axis`. */
const rotationWithAxis = (axis: Vec4, hint: Vec4[]): Mat4 => {
  const cols: Vec4[] = [axis];
  for (const h of [...hint, [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]] as Vec4[]) {
    if (cols.length === 4) break;
    let v = h;
    for (const c of cols) v = addScaled(v, c, -dot(v, c));
    if (len(v) > 1e-6) cols.push(normalize(v));
  }
  const m = identity();
  const order = [cols[1], cols[0], cols[2], cols[3]];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) m[4 * i + j] = order[j][i];
  return m;
};

export class Field {
  readonly world = new World();
  readonly pins: Pin[] = [];
  skittle: Body | null = null;
  /** Seconds since the skittle was released. */
  flightTime = 0;

  constructor() {
    for (const [number, x, z, w] of RACK) {
      const body = this.world.addBody(pinShape());
      this.pins.push({ number, body });
      this.standPin(body, [x, 0, z, w]);
    }
  }

  /** Put every pin back in the opening rack. */
  rack(): void {
    this.removeSkittle();
    RACK.forEach(([, x, z, w], i) => {
      this.standPin(this.pins[i].body, [x, 0, z, w]);
    });
  }

  /** Stand a pin upright and asleep, base centre on the ground, number toward +Z. */
  private standPin(body: Body, ground: Vec4): void {
    body.rot.set(body.shape.P);
    const offset = mulMV(body.rot, body.shape.baseCenter);
    body.pos = [ground[0] - offset[0], -offset[1], ground[2] - offset[2], ground[3] - offset[3]];
    body.vel = [0, 0, 0, 0];
    body.omega = [0, 0, 0, 0, 0, 0];
    body.asleep = true;
    body.quietTime = 0;
    body.refresh();
  }

  launch(input: ThrowInput): Body {
    this.removeSkittle();
    const body = this.world.addBody(skittleShape());
    const direction = throwDirection(input);
    const side = lateralAxis(input.slice);
    const forward = normalize([direction[0], 0, direction[2], direction[3]]);
    const across = normalize(addScaled(side, forward, -dot(side, forward)));
    const axis =
      input.style === "deep" ? hiddenAxis(input.slice) : input.style === "spear" ? forward : across;
    body.rot.set(mulMM(rotationWithAxis(axis, [[0, 1, 0, 0], forward]), body.shape.P));
    body.pos = releasePoint();
    body.vel = scale(direction, input.speed);
    // A little backspin, as from an underhand release.
    body.omega =
      input.style === "spear" ? [0, 0, 0, 0, 0, 0] : scale6(wedge([0, 1, 0, 0], forward), 5);
    body.refresh();
    this.skittle = body;
    this.flightTime = 0;
    return body;
  }

  removeSkittle(): void {
    if (this.skittle) this.world.removeBody(this.skittle);
    this.skittle = null;
  }

  step(dt: number): void {
    this.world.step(dt);
    if (this.skittle) this.flightTime += dt;
    // A body that left the field stops where it is.
    for (const b of this.world.bodies) {
      if (!b.asleep && (len(b.pos) > 40 || b.pos[1] < -1)) {
        b.asleep = true;
        b.vel = [0, 0, 0, 0];
        b.omega = [0, 0, 0, 0, 0, 0];
      }
    }
  }

  /** True when everything is at rest, or when the throw has run out of time. */
  settled(): boolean {
    return this.world.allAsleep() || this.flightTime > 9;
  }

  pinState(pin: Pin): PinState {
    const body = pin.body;
    const up = Math.abs(body.axis()[1]);
    if (up > 0.94) return "standing";
    // Fallen means flat on the ground. A pin that rests on another pin or on the
    // skittle is higher or steeper, and does not count.
    if (up < 0.26 && body.pos[1] < PIN_RADIUS * 1.4) return "fallen";
    return "leaning";
  }

  /** Numbers of the pins that count as fallen, lowest first. */
  fallen(): number[] {
    return this.pins
      .filter((p) => this.pinState(p) === "fallen")
      .map((p) => p.number)
      .sort((a, b) => a - b);
  }

  /**
   * Stand fallen and leaning pins back up where their base met the ground, nearest the
   * throwing line first. A pin never ends up inside another one.
   */
  restand(): void {
    this.removeSkittle();
    const placed: Vec4[] = [];
    const moved: { pin: Pin; ground: Vec4 }[] = [];
    for (const pin of this.pins) {
      const state = this.pinState(pin);
      const body = pin.body;
      const base = body.toWorld(body.shape.baseCenter);
      const axis = body.axis();
      const tilted = Math.abs(axis[1]) < 0.9999 || !body.asleep || base[1] > 0.002;
      if (state === "standing" && !tilted) {
        placed.push([base[0], 0, base[2], base[3]]);
        continue;
      }
      let ground: Vec4 = [base[0], 0, base[2], base[3]];
      if (state !== "standing") {
        const flat = normalize([axis[0], 0, axis[2], axis[3]]);
        // Lowest point of the base: straight down inside the base ball.
        const down = normalize(addScaled([0, -1, 0, 0], axis, axis[1]));
        const touch = addScaled(base, down, PIN_RADIUS);
        if (touch[1] < 0.02)
          ground = add([touch[0], 0, touch[2], touch[3]], scale(flat, PIN_RADIUS));
        else ground = [body.pos[0], 0, body.pos[2], body.pos[3]];
      }
      moved.push({ pin, ground });
    }
    moved.sort((a, b) => b.ground[2] - a.ground[2]);
    const clearance = PIN_RADIUS * 2 + 0.002;
    for (const m of moved) {
      let g = m.ground;
      for (let pass = 0; pass < 24; pass++) {
        let clear = true;
        for (const q of placed) {
          const d = sub(g, q);
          const l = len(d);
          if (l >= clearance) continue;
          clear = false;
          const away = l > 1e-6 ? scale(d, 1 / l) : ([0, 0, -1, 0] as Vec4);
          g = addScaled(q, away, clearance + 1e-4);
        }
        if (clear) break;
      }
      placed.push(g);
      this.standPin(m.pin.body, g);
    }
  }
}

const scale6 = (b: number[], s: number): [number, number, number, number, number, number] => [
  b[0] * s,
  b[1] * s,
  b[2] * s,
  b[3] * s,
  b[4] * s,
  b[5] * s,
];
