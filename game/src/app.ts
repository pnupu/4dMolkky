// The game: scene, input, turn flow and camera.

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { Sound } from "./audio";
import { Field, LINE_Z, type ThrowInput, type ThrowStyle } from "./game/field";
import { Match, type ThrowOutcome } from "./game/rules";
import { type Mat4, orthonormalize, type Vec4 } from "./math4";
import { AimGuide } from "./render/aim";
import { Cabin } from "./render/cabin";
import { Dust } from "./render/dust";
import { Environment } from "./render/environment";
import { PinVisual } from "./render/pins";
import { type CompassDot, Hud } from "./ui/hud";
import { type LabelItem, LabelLayer } from "./ui/labels";

type Phase = "menu" | "aim" | "charge" | "flight" | "result" | "restand" | "over";

const STEP = 1 / 60;
const MIN_SPEED = 4.0;
const MAX_SPEED = 8.6;
const MIN_LOFT = (8 * Math.PI) / 180;
const MAX_LOFT = (50 * Math.PI) / 180;
const CHARGE_TIME = 1.25;
const STYLES: ThrowStyle[] = ["wide", "deep", "spear"];
const BEST_KEY = "molkky4d.best";
// The aim camera stands behind the throwing line, low, with a long lens on the rack.
const AIM_POSITION = new THREE.Vector3(0, 0.9, LINE_Z - 0.5);
const AIM_TARGET = new THREE.Vector3(0, 0.5, 0);
const AIM_FOV = 28;
const ZOOM_FOV = 11;
const COLOR_BELOW_CSS = "#7cc0ff";
const COLOR_ABOVE_CSS = "#ffc06a";

// Storage can be unavailable (private windows, embedded frames): the game works without it.
const readBest = (): number | null => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || null;
  } catch {
    return null;
  }
};
const writeBest = (throws: number): void => {
  try {
    window.localStorage.setItem(BEST_KEY, String(throws));
  } catch {
    // Nothing to do: the best score is a convenience.
  }
};

interface Pose {
  pos: Vec4;
  rot: Mat4;
}

/** What automated checks read and drive through `window.molkky`. */
export interface DebugApi {
  state: () => {
    phase: Phase;
    paused: boolean;
    slice: number;
    scores: number[];
    misses: number[];
    current: number;
    winner: number | null;
    over: boolean;
    throws: number;
    pins: { number: number; state: string; x: number; z: number; w: number }[];
    fps: number;
  };
  /** Throw at once with the given aim. Works in the aim phase. */
  throw: (input: Partial<ThrowInput> & { power?: number }) => boolean;
  start: (names: string[]) => void;
  setSlice: (angle: number) => void;
  /** Physics steps per rendered frame during a throw, to shorten automated matches. */
  speed: number;
  /** Fix the camera for a screenshot: position, target, field of view. Null frees it. */
  view: (view: [number, number, number, number, number, number, number] | null) => void;
  /** Stop the real-time clock and draw one frame `dt` seconds later, for video capture. */
  advance: (dt: number) => void;
}

export class App {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(36, 1, 0.05, 6000);
  private readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;
  private readonly environment: Environment;
  private readonly aim = new AimGuide();
  private readonly cabin = new Cabin();
  private readonly dust = new Dust();
  private readonly hud: Hud;
  private readonly sound = new Sound();
  private readonly labelLayer = new LabelLayer();
  private readonly field = new Field();
  private readonly pinVisuals: PinVisual[];
  private skittleVisual: PinVisual | null = null;
  private match: Match | null = null;
  private names: string[] = ["You"];

  private phase: Phase = "menu";
  private paused = false;
  private phaseTime = 0;
  private clock = 0;
  private lastFrame = 0;
  private accumulator = 0;
  private fps = 60;
  private pixelRatio = 1;
  private slowTime = 0;
  private fastTime = 0;

  private slice = 0;
  private sliceTarget = 0;
  private yaw = 0;
  private loft = (17 * Math.PI) / 180;
  private style: ThrowStyle = "wide";
  private power = 0;
  private zoom = false;
  private touchTurn = 0;
  private labels = true;
  private readonly keys = new Set<string>();
  private readonly pointer = new THREE.Vector2(0, -0.2);
  private readonly raycaster = new THREE.Raycaster();
  private readonly cameraPosition = AIM_POSITION.clone();
  private readonly cameraTarget = AIM_TARGET.clone();
  private fixedView: number[] | null = null;
  private restandFrom: Pose[] = [];
  private restandTo: Pose[] = [];
  private outcome: ThrowOutcome | null = null;
  private hinted = false;
  debugSpeed = 1;
  /** When set, time only moves through `advance`: frame-exact video capture. */
  private manualClock = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;

    this.environment = new Environment(this.renderer, this.scene);
    this.scene.add(this.environment.group, this.aim.group, this.cabin.group, this.dust.group);
    this.aim.hide();
    this.pinVisuals = this.field.pins.map((pin) => new PinVisual(pin.body, pin.number));
    for (const visual of this.pinVisuals) this.scene.add(visual.group);

    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const target = new THREE.WebGLRenderTarget(size.x, size.y, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(size, 0.16, 0.5, 1.6);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.hud = new Hud({
      start: (names) => this.startMatch(names),
      resume: () => this.setPaused(false),
      menu: () => this.toMenu(),
      restart: () => this.startMatch(this.names),
      cycleStyle: () => this.cycleStyle(),
      cycleLoft: () => this.cycleLoft(),
      turnTo: (x, w) => this.turnTo(x, w),
      turnHold: (direction) => {
        this.touchTurn = direction;
      },
    });
    canvas.after(this.labelLayer.canvas);
    this.hud.showMenu(true);
    this.hud.setThrowSetup(this.style, (this.loft * 180) / Math.PI);

    this.bindInput();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && this.match && !this.match.over)
        this.setPaused(true);
    });
    this.lastFrame = performance.now();
    this.renderer.setAnimationLoop((now) => this.frame(now));
  }

  // --- Match flow ----------------------------------------------------------------

  private startMatch(names: string[]): void {
    this.sound.unlock();
    this.names = names;
    this.match = new Match(names);
    this.field.rack();
    this.removeSkittleVisual();
    // The menu turns the slice slowly: start the match at angle 0 without a whip back.
    this.slice = this.sliceTarget = 0;
    this.yaw = 0;
    this.paused = false;
    this.hud.showMenu(false);
    this.hud.showPause(false);
    this.hud.hideGameOver();
    this.hud.setPlaying(true);
    this.hud.setScores(this.match);
    this.setPhase("aim");
    if (!this.hinted) {
      this.hinted = true;
      const turn = window.matchMedia("(pointer: coarse)").matches
        ? "Hold a round button to turn your view through it"
        : "Scroll to turn your view through it";
      this.hud.showHint(
        `Half of the rack is hidden in the fourth dimension. ${turn}, then hold and release to throw.`,
        9,
      );
    }
  }

  private toMenu(): void {
    this.match = null;
    this.paused = false;
    this.field.rack();
    this.removeSkittleVisual();
    this.sliceTarget = 0;
    this.hud.setPlaying(false);
    this.hud.showPause(false);
    this.hud.hideGameOver();
    this.hud.showMenu(true);
    this.setPhase("menu");
  }

  private setPaused(paused: boolean): void {
    if (!this.match || this.phase === "menu" || this.phase === "over") return;
    this.paused = paused;
    this.hud.showPause(paused);
    if (paused && this.phase === "charge") this.setPhase("aim");
  }

  private setPhase(phase: Phase): void {
    this.phase = phase;
    this.phaseTime = 0;
    this.hud.setThrowbar(phase === "aim" || phase === "charge");
    if (phase === "aim") {
      this.power = 0;
      this.hud.setPower(0);
    }
  }

  private currentInput(): ThrowInput {
    return {
      slice: this.slice,
      yaw: this.yaw,
      loft: this.loft,
      speed: MIN_SPEED + (MAX_SPEED - MIN_SPEED) * this.power,
      style: this.style,
    };
  }

  private beginCharge(): void {
    if (this.phase !== "aim" || this.paused) return;
    this.sound.unlock();
    this.sound.tick();
    this.setPhase("charge");
  }

  private releaseCharge(): void {
    if (this.phase !== "charge") return;
    this.launch(this.currentInput());
  }

  private launch(input: ThrowInput): void {
    const body = this.field.launch(input);
    this.removeSkittleVisual();
    this.skittleVisual = new PinVisual(body, null);
    this.scene.add(this.skittleVisual.group);
    this.sound.whoosh(this.power);
    this.accumulator = 0;
    this.aim.hide();
    this.setPhase("flight");
  }

  private removeSkittleVisual(): void {
    if (!this.skittleVisual) return;
    this.scene.remove(this.skittleVisual.group);
    this.skittleVisual.dispose();
    this.skittleVisual = null;
  }

  private judge(): void {
    if (!this.match) return;
    const player = this.match.players[this.match.current];
    this.outcome = this.match.applyThrow(this.field.fallen());
    this.hud.showOutcome(this.outcome, player.name);
    this.hud.setScores(this.match);
    if (this.outcome.winner !== null) this.sound.win();
    else if (this.outcome.points > 0) this.sound.score(this.outcome.points);
    else this.sound.miss();
    this.setPhase("result");
  }

  private beginRestand(): void {
    const pose = (): Pose[] =>
      this.field.pins.map((p) => ({ pos: [...p.body.pos] as Vec4, rot: p.body.rot.slice() }));
    this.restandFrom = pose();
    this.field.restand();
    this.restandTo = pose();
    this.removeSkittleVisual();
    this.setPhase("restand");
  }

  private finishTurn(): void {
    if (!this.match) return;
    if (this.match.over) {
      let best: number | null = null;
      if (this.match.solo) {
        const stored = readBest();
        best = stored;
        if (this.match.winner !== null) {
          const throws = this.match.players[0].throws.length;
          if (stored === null || throws < stored) {
            best = throws;
            writeBest(throws);
          }
        }
      }
      this.hud.setThrowbar(false);
      this.hud.showGameOver(this.match, best);
      this.setPhase("over");
      return;
    }
    this.hud.setScores(this.match);
    this.setPhase("aim");
  }

  private cycleStyle(): void {
    this.style = STYLES[(STYLES.indexOf(this.style) + 1) % STYLES.length];
    this.hud.setThrowSetup(this.style, (this.loft * 180) / Math.PI);
    this.sound.tick();
  }

  /** Step the loft through a few useful angles: flat, normal, high, lob. */
  private cycleLoft(): void {
    const steps = [10, 17, 28, 40];
    const degrees = (this.loft * 180) / Math.PI;
    const next = steps.find((s) => s > degrees + 0.5) ?? steps[0];
    this.loft = (next * Math.PI) / 180;
    this.hud.setThrowSetup(this.style, next);
    this.sound.tick();
  }

  /** Turn the slice, by the shorter way, until ground point (x, w) lies in it. */
  private turnTo(x: number, w: number): void {
    if (Math.hypot(x, w) < 1e-4) return;
    const angle = Math.atan2(w, x);
    const steps = Math.round((this.sliceTarget - angle) / Math.PI);
    this.sliceTarget = angle + steps * Math.PI;
  }

  // --- Input ---------------------------------------------------------------------

  private bindInput(): void {
    const canvas = this.canvas;
    canvas.addEventListener("pointermove", (event) => {
      this.pointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      this.pointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      canvas.setPointerCapture(event.pointerId);
      this.beginCharge();
    });
    canvas.addEventListener("pointerup", () => this.releaseCharge());
    canvas.addEventListener("pointercancel", () => {
      if (this.phase === "charge") this.setPhase("aim");
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener(
      "wheel",
      (event) => {
        if (this.phase === "menu" || this.paused) return;
        event.preventDefault();
        const unit = event.deltaMode === 1 ? 16 : 1;
        const delta = THREE.MathUtils.clamp((event.deltaY + event.deltaX) * unit, -120, 120);
        this.sliceTarget += delta * (event.shiftKey ? 0.0006 : 0.0022);
      },
      { passive: false },
    );
    window.addEventListener("keydown", (event) => {
      if (event.target instanceof HTMLInputElement) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === " " || key.startsWith("Arrow")) event.preventDefault();
      if (event.repeat) return;
      this.keys.add(key);
      if (key === "Escape" || key === "p") {
        this.setPaused(!this.paused);
        return;
      }
      if (this.paused || !this.match) return;
      if (key === " ") this.beginCharge();
      else if (key === "t") this.cycleStyle();
      else if (key === "v") this.zoom = !this.zoom;
      else if (key === "l") this.labels = !this.labels;
      else if (key === "m") this.sound.setMuted(!this.sound.muted);
      else if (key === "0")
        this.sliceTarget = Math.round(this.sliceTarget / (Math.PI * 2)) * Math.PI * 2;
    });
    window.addEventListener("keyup", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      this.keys.delete(key);
      if (key === " ") this.releaseCharge();
    });
    window.addEventListener("blur", () => this.keys.clear());
  }

  private updateAim(dt: number): void {
    const fine = this.keys.has("Shift") ? 0.25 : 1;
    let turn = this.touchTurn;
    if (this.keys.has("q") || this.keys.has("ArrowLeft")) turn -= 1;
    if (this.keys.has("e") || this.keys.has("ArrowRight")) turn += 1;
    this.sliceTarget += turn * 0.9 * fine * dt;
    let lift = 0;
    if (this.keys.has("w") || this.keys.has("ArrowUp")) lift += 1;
    if (this.keys.has("s") || this.keys.has("ArrowDown")) lift -= 1;
    if (lift !== 0) {
      this.loft = THREE.MathUtils.clamp(this.loft + lift * 0.35 * dt, MIN_LOFT, MAX_LOFT);
      this.hud.setThrowSetup(this.style, (this.loft * 180) / Math.PI);
    }
    if (this.phase !== "aim" && this.phase !== "charge") return;
    // Aim where the pointer meets the ground.
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const ray = this.raycaster.ray;
    let yaw = this.pointer.x * 0.42;
    if (ray.direction.y < -0.02) {
      const t = -ray.origin.y / ray.direction.y;
      const x = ray.origin.x + ray.direction.x * t;
      const z = ray.origin.z + ray.direction.z * t;
      if (z < LINE_Z - 0.4) yaw = Math.atan2(x, LINE_Z - z);
    }
    this.yaw = THREE.MathUtils.clamp(yaw, -0.7, 0.7);
  }

  // --- Frame ---------------------------------------------------------------------

  private frame(now: number): void {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;
    if (this.manualClock) return;
    this.fps += (1 / Math.max(dt, 1e-4) - this.fps) * 0.05;
    this.adaptResolution(dt);
    this.tick(dt);
  }

  /** Advance the game by `dt` seconds and draw one frame. */
  private tick(dt: number): void {
    this.clock += dt;
    if (!this.paused) this.update(dt);
    this.hud.tick(dt);
    this.updateCamera(dt);
    this.environment.update(this.slice, this.clock);
    this.cabin.update(this.slice);
    this.dust.update(this.paused ? 0 : dt);
    for (const visual of this.pinVisuals) visual.update(this.slice);
    this.skittleVisual?.update(this.slice);
    if (this.match) this.updateCompass();
    this.updateLabels();
    this.composer.render();
  }

  private update(dt: number): void {
    this.phaseTime += dt;
    this.updateAim(dt);
    const before = this.slice;
    this.slice += (this.sliceTarget - this.slice) * (1 - Math.exp(-14 * dt));
    const turned = Math.abs(this.slice - before) / Math.max(dt, 1e-4);
    if (turned > 0.15) this.sound.turn(turned / 2);

    switch (this.phase) {
      case "menu":
        this.sliceTarget += dt * 0.12;
        break;
      case "aim":
        this.aim.update(this.currentInput(), false);
        break;
      case "charge": {
        // Power swings up and back down: release when the ring is where you want it.
        const swing = (this.phaseTime / CHARGE_TIME) % 2;
        const linear = swing < 1 ? swing : 2 - swing;
        this.power = linear * linear * (3 - 2 * linear);
        this.hud.setPower(this.power);
        this.aim.update(this.currentInput(), true);
        break;
      }
      case "flight": {
        this.accumulator += dt * this.debugSpeed;
        let steps = 0;
        while (this.accumulator >= STEP && steps < 12 * this.debugSpeed) {
          this.field.step(STEP);
          this.accumulator -= STEP;
          steps++;
          for (const impact of this.field.world.impacts) {
            if (impact.ground) {
              this.sound.thud(impact.strength);
              // Dust only where the slice can see the ground that was hit.
              const [x, , z, w] = impact.point;
              const c = Math.cos(this.slice);
              const s = Math.sin(this.slice);
              if (impact.strength > 0.12 && Math.abs(-x * s + w * c) < 0.12)
                this.dust.burst(x * c + w * s, z, Math.min(1, impact.strength / 1.2));
            } else this.sound.knock(impact.strength);
          }
        }
        if (this.field.settled() && this.field.flightTime > 0.8) this.judge();
        break;
      }
      case "result":
        if (this.phaseTime > 1.7 / this.debugSpeed) this.beginRestand();
        break;
      case "restand": {
        const t = Math.min(this.phaseTime / (0.75 / this.debugSpeed), 1);
        const ease = t * t * (3 - 2 * t);
        this.field.pins.forEach((pin, i) => {
          const from = this.restandFrom[i];
          const to = this.restandTo[i];
          const body = pin.body;
          const moved = from.pos.some((v, k) => Math.abs(v - to.pos[k]) > 1e-6);
          for (let k = 0; k < 4; k++) body.pos[k] = from.pos[k] + (to.pos[k] - from.pos[k]) * ease;
          if (moved) body.pos[1] += Math.sin(Math.PI * ease) * 0.035;
          for (let k = 0; k < 16; k++) body.rot[k] = from.rot[k] + (to.rot[k] - from.rot[k]) * ease;
          orthonormalize(body.rot);
          if (t >= 1) {
            body.pos = [...to.pos] as Vec4;
            body.rot.set(to.rot);
          }
          body.refresh();
        });
        if (t >= 1) this.finishTurn();
        break;
      }
      case "over":
        break;
    }
  }

  private updateLabels(): void {
    const items: LabelItem[] = [];
    if (this.labels && this.match && !this.paused && this.phase !== "over") {
      const point = new THREE.Vector3();
      for (const visual of this.pinVisuals) {
        point.copy(visual.labelAnchor).project(this.camera);
        if (point.z > 1 || Math.abs(point.x) > 1.05 || Math.abs(point.y) > 1.05) continue;
        const ghost = visual.ghostStrength > 0.5;
        const alpha = ghost ? Math.min(1, 0.25 + visual.ghostOpacity) : 1;
        items.push({
          text: String(visual.number),
          x: (point.x * 0.5 + 0.5) * window.innerWidth,
          y: (-point.y * 0.5 + 0.5) * window.innerHeight,
          tint: ghost ? (visual.hidden > 0 ? COLOR_ABOVE_CSS : COLOR_BELOW_CSS) : null,
          alpha,
        });
      }
    }
    this.labelLayer.draw(items);
  }

  private updateCamera(dt: number): void {
    if (this.fixedView) {
      const v = this.fixedView;
      this.camera.position.set(v[0], v[1], v[2]);
      this.camera.lookAt(v[3], v[4], v[5]);
      this.camera.fov = v[6];
      this.camera.updateProjectionMatrix();
      return;
    }
    const position = AIM_POSITION.clone();
    const target = AIM_TARGET.clone();
    let fov = this.zoom ? ZOOM_FOV : AIM_FOV;
    if (this.phase === "menu") {
      const a = this.clock * 0.08;
      position.set(Math.sin(a) * 1.9, 0.5, Math.cos(a) * 1.9 + 0.1);
      target.set(0, 0.16, 0);
      fov = 32;
      // The menu card sits on the left: look past the rack so it shows on the right.
      if (window.innerWidth > 900) {
        const right = new THREE.Vector3()
          .subVectors(target, position)
          .cross(this.camera.up)
          .normalize();
        target.addScaledVector(right, -0.42);
      }
    } else if (this.phase === "flight" || this.phase === "result" || this.phase === "restand") {
      // Move in on the pins once the skittle is on its way.
      const centroid = new THREE.Vector3();
      for (const visual of this.pinVisuals) centroid.add(visual.center);
      centroid.multiplyScalar(1 / this.pinVisuals.length);
      const flown = this.phase === "flight" ? Math.min(this.phaseTime / 0.35, 1) : 1;
      position.lerp(new THREE.Vector3(centroid.x + 0.55, 0.4, centroid.z + 1.5), flown);
      target.lerp(new THREE.Vector3(centroid.x, 0.07, centroid.z - 0.05), flown);
      fov = this.zoom ? ZOOM_FOV : AIM_FOV + 6 * flown;
    } else if (this.zoom) {
      target.set(0, 0.09, 0);
    }
    const k = 1 - Math.exp(-(this.phase === "menu" ? 1.2 : 3.2) * dt);
    this.cameraPosition.lerp(position, k);
    this.cameraTarget.lerp(target, k);
    this.camera.position.copy(this.cameraPosition);
    this.camera.lookAt(this.cameraTarget);
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov += (fov - this.camera.fov) * k;
      this.camera.updateProjectionMatrix();
    }
  }

  private updateCompass(): void {
    const c = Math.cos(this.slice);
    const s = Math.sin(this.slice);
    const dots: CompassDot[] = this.field.pins.map((pin) => {
      const [x, , , w] = pin.body.pos;
      return { label: String(pin.number), side: x * c + w * s, hidden: -x * s + w * c, x, w };
    });
    if (this.field.skittle) {
      const [x, , , w] = this.field.skittle.pos;
      dots.push({ label: "", side: x * c + w * s, hidden: -x * s + w * c, x, w, skittle: true });
    }
    const degrees = ((((this.slice * 180) / Math.PI) % 360) + 360) % 360;
    this.hud.drawCompass(dots, degrees);
  }

  /** Lower the render resolution when frames run long, and raise it again when they do not. */
  private adaptResolution(dt: number): void {
    const max = Math.min(window.devicePixelRatio || 1, 2);
    this.slowTime = this.fps < 48 ? this.slowTime + dt : 0;
    this.fastTime = this.fps > 58 ? this.fastTime + dt : 0;
    let next = this.pixelRatio;
    if (this.slowTime > 1.5 && this.pixelRatio > 0.75)
      next = Math.max(0.75, this.pixelRatio - 0.25);
    else if (this.fastTime > 6 && this.pixelRatio < max)
      next = Math.min(max, this.pixelRatio + 0.25);
    if (next === this.pixelRatio) return;
    this.pixelRatio = next;
    this.slowTime = this.fastTime = 0;
    this.renderer.setPixelRatio(next);
    this.resize();
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(this.pixelRatio);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.labelLayer.resize();
  }

  // --- Automation ----------------------------------------------------------------

  debugApi(): DebugApi {
    const app = this;
    return {
      state: () => ({
        phase: app.phase,
        paused: app.paused,
        slice: app.slice,
        scores: app.match?.players.map((p) => p.score) ?? [],
        misses: app.match?.players.map((p) => p.misses) ?? [],
        current: app.match?.current ?? 0,
        winner: app.match?.winner ?? null,
        over: app.match?.over ?? false,
        throws: app.match?.throwCount ?? 0,
        pins: app.field.pins.map((p) => ({
          number: p.number,
          state: app.field.pinState(p),
          x: p.body.pos[0],
          z: p.body.pos[2],
          w: p.body.pos[3],
        })),
        fps: app.fps,
      }),
      throw: (input) => {
        if (app.phase !== "aim" || app.paused) return false;
        if (input.slice !== undefined) app.slice = app.sliceTarget = input.slice;
        if (input.yaw !== undefined) app.yaw = input.yaw;
        if (input.loft !== undefined) app.loft = input.loft;
        if (input.style !== undefined) app.style = input.style;
        if (input.power !== undefined) app.power = input.power;
        const throwInput = app.currentInput();
        if (input.speed !== undefined) throwInput.speed = input.speed;
        app.launch(throwInput);
        return true;
      },
      start: (names) => app.startMatch(names),
      setSlice: (angle) => {
        app.sliceTarget = angle;
      },
      view: (view) => {
        app.fixedView = view;
      },
      advance: (dt) => {
        app.manualClock = true;
        app.tick(dt);
      },
      get speed() {
        return app.debugSpeed;
      },
      set speed(value: number) {
        app.debugSpeed = value;
      },
    };
  }
}
