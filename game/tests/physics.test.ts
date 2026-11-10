import { describe, expect, test } from "bun:test";
import { PIN_HEIGHT, PIN_RADIUS, pinShape, skittleShape } from "../src/game/equipment";
import {
  type Biv,
  bivApply,
  bivNorm,
  bivToBody,
  bivToWorld,
  dot,
  jacobiEigen,
  len,
  type Mat4,
  mulMM,
  mulMV,
  planeRotation,
  transpose,
  type Vec4,
  wedge,
} from "../src/math4";
import { type Body, World } from "../src/physics/world";

const run = (world: World, seconds: number): void => {
  for (let i = 0; i < Math.round(seconds * 60); i++) world.step(1 / 60);
};

/** Place a body so that its shape frame has rotation `shapeRot` and its base centre is at `base`. */
const place = (body: Body, shapeRot: Mat4, base: Vec4): void => {
  body.rot.set(mulMM(shapeRot, body.shape.P));
  const offset = mulMV(body.rot, body.shape.baseCenter);
  body.pos = [base[0] - offset[0], base[1] - offset[1], base[2] - offset[2], base[3] - offset[3]];
  body.refresh();
};

const tiltFromVertical = (body: Body): number =>
  (Math.acos(Math.min(1, Math.abs(body.axis()[1]))) * 180) / Math.PI;

describe("math", () => {
  test("a bivector turns a vector at right angles to it", () => {
    const b: Biv = [0.3, -1.2, 0.7, 2.1, -0.4, 0.9];
    const r: Vec4 = [0.5, -0.2, 1.4, 0.8];
    expect(dot(bivApply(b, r), r)).toBeCloseTo(0, 12);
  });

  test("rotating a bivector to the body frame and back returns it", () => {
    const r = mulMM(
      planeRotation(0, 3, 0.7),
      mulMM(planeRotation(1, 2, -1.1), planeRotation(2, 3, 0.4)),
    );
    const b: Biv = [0.3, -1.2, 0.7, 2.1, -0.4, 0.9];
    const back = bivToWorld(r, bivToBody(r, b));
    for (let k = 0; k < 6; k++) expect(back[k]).toBeCloseTo(b[k], 12);
  });

  test("Jacobi diagonalises a symmetric matrix", () => {
    const s = [
      [4, 1, 0.5, 0],
      [1, 3, 0.2, 0.1],
      [0.5, 0.2, 2, 0.3],
      [0, 0.1, 0.3, 1],
    ];
    const { values, vectors } = jacobiEigen(s);
    for (let k = 0; k < 4; k++) {
      const v: Vec4 = [vectors[k], vectors[4 + k], vectors[8 + k], vectors[12 + k]];
      const sv = s.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2] + row[3] * v[3]);
      for (let i = 0; i < 4; i++) expect(sv[i]).toBeCloseTo(values[k] * v[i], 10);
    }
  });
});

describe("shape", () => {
  test("the cut pin has its centre of mass low and toward the tall side", () => {
    const pin = pinShape();
    expect(pin.com[1]).toBeLessThan(0);
    expect(pin.com[2]).toBeLessThan(0);
    expect(Math.abs(pin.com[0])).toBeLessThan(1e-9);
    expect(Math.abs(pin.com[3])).toBeLessThan(1e-9);
  });

  test("the signed distance is zero on every surface and negative inside", () => {
    const pin = pinShape();
    const g: Vec4 = [0, 0, 0, 0];
    expect(pin.sdf([PIN_RADIUS, 0, 0, 0], g)).toBeCloseTo(0, 12);
    expect(pin.sdf([0, 0, 0, PIN_RADIUS], g)).toBeCloseTo(0, 12);
    expect(pin.sdf([0, -PIN_HEIGHT / 2, 0, 0], g)).toBeCloseTo(0, 12);
    expect(pin.sdf([0, pin.topAt(0), 0, 0], g)).toBeCloseTo(0, 12);
    expect(pin.sdf([0, 0, 0, 0], g)).toBeLessThan(0);
    for (const rim of pin.rims)
      for (const s of rim.samples) expect(Math.abs(pin.sdf(pin.toShape(s), g))).toBeLessThan(1e-9);
  });

  test("the skittle has the inertia of a solid spherinder", () => {
    const s = skittleShape();
    const r = s.radius;
    const h = s.height;
    // Planes that contain the axis: m (h^2/12 + r^2/5). Planes across it: m (2 r^2 / 5).
    const axial = s.mass * ((h * h) / 12 + (r * r) / 5);
    const cross = s.mass * ((2 * r * r) / 5);
    const inertia = s.invInertia.map((v) => 1 / v).sort((a, b) => a - b);
    for (const v of inertia.slice(0, 3)) expect(v / cross).toBeCloseTo(1, 1);
    for (const v of inertia.slice(3)) expect(v / axial).toBeCloseTo(1, 1);
  });
});

describe("free motion", () => {
  test("a tumbling skittle keeps its angular momentum and energy", () => {
    const world = new World();
    world.gravity = 0;
    const body = world.addBody(skittleShape());
    body.pos = [0, 5, 0, 0];
    body.omega = [3, -2, 4, 1.5, -2.5, 0.8];
    body.refresh();
    const l0 = body.angularMomentum();
    const e0 = body.kineticEnergy();
    // Free flight has a little air drag; turn it off by measuring over a short time.
    run(world, 0.5);
    const l1 = body.angularMomentum();
    const drag = Math.exp(-0.05 * 0.5);
    for (let k = 0; k < 6; k++) expect(l1[k] / drag).toBeCloseTo(l0[k], 3);
    expect(body.kineticEnergy() / (drag * drag) / e0).toBeCloseTo(1, 2);
  });
});

describe("a single pin on the ground", () => {
  test("stands still and falls asleep", () => {
    const world = new World();
    const pin = world.addBody(pinShape());
    place(pin, planeRotation(0, 1, 0), [0, 0.002, 0, 0]);
    run(world, 2);
    expect(pin.asleep).toBe(true);
    expect(tiltFromVertical(pin)).toBeLessThan(0.5);
    expect(len([pin.pos[0], 0, pin.pos[2], pin.pos[3]])).toBeLessThan(0.002);
  });

  test("rocks back upright from a small tilt", () => {
    const world = new World();
    const pin = world.addBody(pinShape());
    place(pin, planeRotation(1, 0, (6 * Math.PI) / 180), [0, 0.001, 0, 0]);
    run(world, 3);
    expect(tiltFromVertical(pin)).toBeLessThan(1);
  });

  for (const [name, axis] of [
    ["X", 0],
    ["Z", 2],
    ["W", 3],
  ] as const) {
    test(`falls flat along ${name} from a large tilt`, () => {
      const world = new World();
      const pin = world.addBody(pinShape());
      place(pin, planeRotation(1, axis, (35 * Math.PI) / 180), [0, 0.001, 0, 0]);
      run(world, 4);
      const a = pin.axis();
      expect(tiltFromVertical(pin)).toBeGreaterThan(80);
      expect(Math.abs(a[axis])).toBeGreaterThan(0.95);
      expect(pin.pos[1]).toBeLessThan(PIN_RADIUS * 1.2);
      expect(pin.pos[1]).toBeGreaterThan(PIN_RADIUS * 0.7);
      expect(pin.asleep).toBe(true);
    });
  }
});

describe("collisions", () => {
  test("a skittle knocks a pin over and nothing sinks or explodes", () => {
    const world = new World();
    const pin = world.addBody(pinShape());
    place(pin, planeRotation(0, 1, 0), [0, 0, 0, 0]);
    pin.asleep = true;
    const skittle = world.addBody(skittleShape());
    // Axis along X, flying toward -Z at pin height.
    place(skittle, planeRotation(1, 0, Math.PI / 2), [-0.11, 0.08, 0.6, 0]);
    skittle.vel = [0, 0, -5, 0];
    let deepest = 0;
    let highest = 0;
    for (let i = 0; i < 60 * 8; i++) {
      world.step(1 / 60);
      deepest = Math.max(deepest, world.maxPenetration);
      for (const b of world.bodies) {
        highest = Math.max(highest, b.pos[1]);
        expect(Number.isFinite(b.pos[0] + b.pos[1] + b.pos[2] + b.pos[3])).toBe(true);
        expect(b.pos[1]).toBeGreaterThan(0.01);
      }
    }
    expect(tiltFromVertical(pin)).toBeGreaterThan(80);
    expect(pin.pos[2]).toBeLessThan(-0.05);
    expect(deepest).toBeLessThan(0.012);
    expect(highest).toBeLessThan(1.5);
    expect(world.allAsleep()).toBe(true);
  });

  test("a hit that is offset in W pushes the pin along W", () => {
    const world = new World();
    const pin = world.addBody(pinShape());
    place(pin, planeRotation(0, 1, 0), [0, 0, 0, 0]);
    pin.asleep = true;
    const skittle = world.addBody(skittleShape());
    // End-on, offset in W by most of a radius: the contact normal has a W part.
    place(skittle, planeRotation(1, 2, Math.PI / 2), [0, 0.07, 0.5, 0.04]);
    skittle.vel = [0, 0, -5, 0];
    for (let i = 0; i < 120 && pin.asleep; i++) world.step(1 / 60);
    expect(pin.asleep).toBe(false);
    world.step(1 / 60);
    // Pushed away from the skittle: back along Z and toward -W. Nothing acts along X.
    expect(pin.vel[2]).toBeLessThan(-0.3);
    expect(pin.vel[3]).toBeLessThan(-0.1);
    expect(Math.abs(pin.vel[0])).toBeLessThan(0.01);
    expect(skittle.vel[3]).toBeGreaterThan(0.05);
  });

  test("two pins side by side do not push each other apart", () => {
    const world = new World();
    const a = world.addBody(pinShape());
    const b = world.addBody(pinShape());
    place(a, planeRotation(0, 1, 0), [0, 0.001, 0, 0]);
    place(b, planeRotation(0, 1, 0), [0, 0.001, 0, 2 * PIN_RADIUS + 0.0005]);
    run(world, 2);
    expect(Math.abs(b.pos[3] - a.pos[3] - 2 * PIN_RADIUS)).toBeLessThan(0.002);
    expect(tiltFromVertical(a)).toBeLessThan(0.5);
    expect(tiltFromVertical(b)).toBeLessThan(0.5);
  });

  test("the same throw gives the same result", () => {
    const once = (): number[] => {
      const world = new World();
      const pin = world.addBody(pinShape());
      place(pin, planeRotation(0, 1, 0), [0, 0, 0, 0]);
      const skittle = world.addBody(skittleShape());
      place(skittle, planeRotation(1, 0, Math.PI / 2), [-0.1, 0.08, 0.6, 0.01]);
      skittle.vel = [0, 1, -6, 0];
      skittle.omega = wedge([0, 1, 0, 0], [0, 0, 4, 0]);
      run(world, 3);
      return [...pin.pos, ...skittle.pos, bivNorm(skittle.omega)];
    };
    expect(once()).toEqual(once());
  });
});

test("transpose is its own inverse", () => {
  const r = planeRotation(0, 3, 0.3);
  expect([...transpose(transpose(r))]).toEqual([...r]);
});
