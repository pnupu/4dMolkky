import { describe, expect, test } from "bun:test";
import { PIN_RADIUS, pinShape, skittleShape } from "../src/game/equipment";
import { type Mat4, mulMM, mulMV, planeRotation, type Vec4 } from "../src/math4";
import { type Body, World } from "../src/physics/world";

/** Place a body so that its shape frame has rotation `shapeRot` and its base centre is at `base`. */
const place = (body: Body, shapeRot: Mat4, base: Vec4): void => {
  body.rot.set(mulMM(shapeRot, body.shape.P));
  const offset = mulMV(body.rot, body.shape.baseCenter);
  body.pos = [base[0] - offset[0], base[1] - offset[1], base[2] - offset[2], base[3] - offset[3]];
  body.refresh();
};

describe("the ground is dead, and the skittle is heavy", () => {
  test("the skittle weighs several pins", () => {
    expect(skittleShape().mass / pinShape().mass).toBeGreaterThan(3);
  });

  test("a skittle dropped flat from 40 cm does not rebound", () => {
    const world = new World();
    const skittle = world.addBody(skittleShape());
    place(skittle, planeRotation(1, 0, Math.PI / 2), [-0.11, 0.4, 0, 0]);
    let landed = false;
    let rebound = 0;
    for (let i = 0; i < 180; i++) {
      world.step(1 / 60);
      if (skittle.grounded) landed = true;
      else if (landed) rebound = Math.max(rebound, skittle.pos[1] - PIN_RADIUS);
    }
    expect(landed).toBe(true);
    expect(rebound).toBeLessThan(0.003);
    expect(skittle.asleep).toBe(true);
  });

  test("a pin that starts sunk in the ground rises out without being thrown up", () => {
    const world = new World();
    const pin = world.addBody(pinShape());
    place(pin, planeRotation(0, 1, 0), [0, -0.006, 0, 0]);
    let fastest = 0;
    for (let i = 0; i < 120; i++) {
      world.step(1 / 60);
      fastest = Math.max(fastest, pin.vel[1]);
    }
    const base = pin.toWorld(pin.shape.baseCenter)[1];
    expect(fastest).toBeLessThan(0.02);
    expect(base).toBeGreaterThan(-0.001);
    expect(base).toBeLessThan(0.002);
    expect(Math.abs(pin.axis()[1])).toBeGreaterThan(0.9999);
  });
});
