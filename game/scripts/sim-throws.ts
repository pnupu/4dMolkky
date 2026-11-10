// Scratch benchmark: throw at the opening rack and print outcome, settle time and cost.
import { Field, type ThrowInput } from "../src/game/field";

const cases: Partial<ThrowInput>[] = [
  {},
  { speed: 7.5, loft: 0.2 },
  { speed: 5.6, loft: 0.5 },
  { yaw: 0.012 },
  { yaw: -0.02, speed: 6.6 },
  { slice: Math.PI / 2 },
  { slice: Math.PI / 4, yaw: 0.01 },
  { style: "deep" },
  { style: "spear", speed: 7 },
];

for (const c of cases) {
  const field = new Field();
  const input: ThrowInput = { slice: 0, yaw: 0, loft: 0.32, speed: 6.3, style: "wide", ...c };
  field.launch(input);
  let worst = 0;
  let total = 0;
  let steps = 0;
  let deepest = 0;
  while (!field.settled()) {
    const t0 = performance.now();
    field.step(1 / 60);
    const ms = performance.now() - t0;
    worst = Math.max(worst, ms);
    total += ms;
    steps++;
    deepest = Math.max(deepest, field.world.maxPenetration);
  }
  const states = field.pins.map((p) => `${p.number}${field.pinState(p)[0]}`).join(" ");
  const spreadW = Math.max(...field.pins.map((p) => Math.abs(p.body.pos[3])));
  console.log(
    JSON.stringify(c),
    `fallen=[${field.fallen()}] t=${field.flightTime.toFixed(1)}s`,
    `ms avg=${(total / steps).toFixed(2)} worst=${worst.toFixed(1)}`,
    `pen=${(deepest * 1000).toFixed(1)}mm maxW=${spreadW.toFixed(2)}`,
    `skittle z=${field.skittle?.pos[2].toFixed(2)}`,
  );
  console.log("   ", states);
}
