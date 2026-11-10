import { describe, expect, test } from "bun:test";
import { PIN_RADIUS } from "../src/game/equipment";
import { Field, RACK, type ThrowInput } from "../src/game/field";
import { Match, throwPoints } from "../src/game/rules";
import { len, mulMM, mulMV, planeRotation, sub } from "../src/math4";

const strong: ThrowInput = { slice: 0, yaw: 0, loft: 0.2, speed: 7.5, style: "wide" };

const play = (field: Field, input: ThrowInput): number[] => {
  field.launch(input);
  while (!field.settled()) field.step(1 / 60);
  return field.fallen();
};

describe("scoring", () => {
  test("one pin scores its number, several score their count", () => {
    expect(throwPoints([])).toBe(0);
    expect(throwPoints([12])).toBe(12);
    expect(throwPoints([12, 3])).toBe(2);
    expect(throwPoints([1, 2, 3, 4, 5])).toBe(5);
  });

  test("exactly 50 wins", () => {
    const match = new Match(["Aino"]);
    for (let i = 0; i < 3; i++) match.applyThrow([12]);
    match.applyThrow([10]);
    const outcome = match.applyThrow([4]);
    expect(match.players[0].score).toBe(50);
    expect(outcome.winner).toBe(0);
    expect(match.over).toBe(true);
  });

  test("going over 50 drops the score to 25", () => {
    const match = new Match(["Aino"]);
    for (let i = 0; i < 4; i++) match.applyThrow([12]);
    const outcome = match.applyThrow([5]);
    expect(outcome.bust).toBe(true);
    expect(match.players[0].score).toBe(25);
    expect(match.over).toBe(false);
  });

  test("three misses in a row end a solo match without a winner", () => {
    const match = new Match(["Aino"]);
    match.applyThrow([]);
    match.applyThrow([]);
    match.applyThrow([7]);
    expect(match.players[0].misses).toBe(0);
    match.applyThrow([]);
    match.applyThrow([]);
    const outcome = match.applyThrow([]);
    expect(outcome.eliminated).toBe(true);
    expect(match.over).toBe(true);
    expect(match.winner).toBeNull();
  });

  test("turns pass in order and skip eliminated players", () => {
    const match = new Match(["Aino", "Eero", "Ilta"]);
    match.applyThrow([3]); // Aino
    expect(match.current).toBe(1);
    for (let round = 0; round < 3; round++) {
      match.applyThrow([]); // Eero misses
      match.applyThrow([1]); // Ilta
      if (round < 2) match.applyThrow([1]); // Aino
    }
    expect(match.players[1].eliminated).toBe(true);
    expect(match.current).toBe(0);
    match.applyThrow([1]); // Aino
    expect(match.current).toBe(2);
  });

  test("the last player left wins with 50, and the eliminated player has 0", () => {
    const match = new Match(["Aino", "Eero"]);
    match.applyThrow([2]); // Aino 2
    match.applyThrow([7]); // Eero 7
    for (let i = 0; i < 3; i++) {
      match.applyThrow([2]);
      if (!match.over) match.applyThrow([]);
    }
    expect(match.over).toBe(true);
    expect(match.winner).toBe(0);
    expect(match.wonByElimination).toBe(true);
    expect(match.players[0].score).toBe(50);
    expect(match.players[1].eliminated).toBe(true);
    expect(match.players[1].score).toBe(0);
  });

  test("a win on points is not a win by elimination", () => {
    const match = new Match(["Aino", "Eero"]);
    for (const pin of [12, 12, 12, 12, 2]) {
      match.applyThrow([pin]);
      if (!match.over) match.applyThrow([1]);
    }
    expect(match.winner).toBe(0);
    expect(match.wonByElimination).toBe(false);
    expect(match.players[0].score).toBe(50);
  });

  test("a solo player keeps the score when three misses end the game", () => {
    const match = new Match(["Aino"]);
    match.applyThrow([9]);
    for (let i = 0; i < 3; i++) match.applyThrow([]);
    expect(match.over).toBe(true);
    expect(match.winner).toBeNull();
    expect(match.players[0].score).toBe(9);
  });
});

describe("field", () => {
  test("the rack has twelve pins that do not overlap", () => {
    expect(RACK.map((r) => r[0]).sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    for (let i = 0; i < RACK.length; i++) {
      for (let j = i + 1; j < RACK.length; j++) {
        const d = Math.hypot(
          RACK[i][1] - RACK[j][1],
          RACK[i][2] - RACK[j][2],
          RACK[i][3] - RACK[j][3],
        );
        expect(d).toBeGreaterThan(PIN_RADIUS * 2);
      }
    }
  });

  test("the rack fills three layers along W", () => {
    const layers = new Set(RACK.map((r) => Math.sign(Math.round(r[3] * 1000))));
    expect([...layers].sort()).toEqual([-1, 0, 1]);
  });

  test("an untouched rack stays standing", () => {
    const field = new Field();
    field.pins[0].body.wake();
    for (const p of field.pins) p.body.wake();
    for (let i = 0; i < 180; i++) field.step(1 / 60);
    expect(field.fallen()).toEqual([]);
    for (const p of field.pins) expect(field.pinState(p)).toBe("standing");
    expect(field.world.allAsleep()).toBe(true);
  });

  test("a strong throw knocks pins down, in W as well", () => {
    const field = new Field();
    const fallen = play(field, strong);
    expect(fallen.length).toBeGreaterThanOrEqual(6);
    const wide = field.pins.filter((p) => Math.abs(p.body.pos[3]) > 0.08);
    expect(wide.length).toBeGreaterThan(0);
  });

  test("a throw that misses leaves the rack alone", () => {
    const field = new Field();
    const fallen = play(field, { ...strong, yaw: 0.4 });
    expect(fallen).toEqual([]);
    for (const p of field.pins) expect(p.body.asleep).toBe(true);
  });

  test("turning the slice a quarter turn throws along W", () => {
    const field = new Field();
    const skittle = field.launch({ ...strong, slice: Math.PI / 2, yaw: 0.3 });
    expect(skittle.vel[3]).toBeGreaterThan(1);
    expect(Math.abs(skittle.vel[0])).toBeLessThan(1e-9);
  });

  test("re-standing puts every pin upright, apart, and keeps its W position", () => {
    const field = new Field();
    play(field, strong);
    const before = field.pins.map((p) => p.body.pos[3]);
    field.restand();
    expect(field.skittle).toBeNull();
    for (const p of field.pins) {
      expect(field.pinState(p)).toBe("standing");
      expect(p.body.asleep).toBe(true);
      expect(Math.abs(p.body.axis()[1])).toBeGreaterThan(0.9999);
    }
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        const a = field.pins[i].body;
        const b = field.pins[j].body;
        const ga = a.toWorld(a.shape.baseCenter);
        const gb = b.toWorld(b.shape.baseCenter);
        expect(len(sub(ga, gb))).toBeGreaterThan(PIN_RADIUS * 2);
      }
    }
    const movedInW = field.pins.filter((p, i) => Math.abs(p.body.pos[3] - before[i]) < 0.2);
    expect(movedInW.length).toBe(12);
    // The field stays quiet after the pins are stood up.
    for (const p of field.pins) p.body.wake();
    for (let i = 0; i < 120; i++) field.step(1 / 60);
    expect(field.fallen()).toEqual([]);
  });

  test("a pin that tips over and is re-stood goes back to where it stood", () => {
    const field = new Field();
    // Spread the rack out, so that only pin 1 is involved.
    field.pins.forEach((p, i) => {
      if (i > 0) p.body.pos[0] += 3 + i;
    });
    const pin = field.pins[0].body;
    const before = pin.toWorld(pin.shape.baseCenter);
    // Tip it 35 degrees toward +X about its base centre and let it fall.
    pin.rot.set(mulMM(planeRotation(1, 0, (35 * Math.PI) / 180), pin.shape.P));
    const offset = mulMV(pin.rot, pin.shape.baseCenter);
    pin.pos = [
      before[0] - offset[0],
      0.001 - offset[1],
      before[2] - offset[2],
      before[3] - offset[3],
    ];
    pin.wake();
    for (let i = 0; i < 360; i++) field.step(1 / 60);
    expect(field.fallen()).toEqual([1]);
    field.restand();
    const after = pin.toWorld(pin.shape.baseCenter);
    // Along the fall the pin pivots back on its base edge. Sideways it may roll a few
    // centimetres while it lies: a lying 4D pin rolls like a ball, heavy side down.
    expect(Math.abs(after[0] - before[0])).toBeLessThan(0.01);
    expect(Math.hypot(after[2] - before[2], after[3] - before[3])).toBeLessThan(0.06);
    expect(Math.abs(pin.axis()[1])).toBeGreaterThan(0.9999);
  });

  test("a full solo match can be played to the end", () => {
    const field = new Field();
    const match = new Match(["Aino"]);
    let throws = 0;
    while (!match.over && throws < 60) {
      const yaw = ((throws * 37) % 11) * 0.004 - 0.02;
      const fallen = play(field, { ...strong, speed: 6 + (throws % 4) * 0.5, yaw });
      match.applyThrow(fallen);
      field.restand();
      throws++;
    }
    expect(match.over).toBe(true);
  });
});
