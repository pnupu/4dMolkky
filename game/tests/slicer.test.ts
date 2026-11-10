import { describe, expect, test } from "bun:test";
import { PIN_RADIUS, pinShape, skittleShape } from "../src/game/equipment";
import { mulMM, planeRotation } from "../src/math4";
import { buildTetMesh, SliceGeometry } from "../src/render/slicer";

/** Cut an upright shape whose centre of mass is `hidden` away from the slice. */
const cut = (shape: ReturnType<typeof pinShape>, hidden: number, rot = shape.P) => {
  const slice = new SliceGeometry(buildTetMesh(shape, 2));
  slice.update(rot, [0, 0, 0, hidden], 0);
  const position = slice.geometry.getAttribute("position").array as Float32Array;
  const normal = slice.geometry.getAttribute("normal").array as Float32Array;
  const face = slice.geometry.getAttribute("aFace").array as Float32Array;
  return { slice, position, normal, face };
};

describe("slicing a 4D pin", () => {
  test("a cut through the centre is a cylinder of the full radius", () => {
    const shape = skittleShape();
    const { slice, position, face } = cut(shape, 0);
    expect(slice.triangles).toBeGreaterThan(100);
    for (let v = 0; v < slice.triangles * 3; v++) {
      if (face[v] !== 0) continue;
      const r = Math.hypot(position[v * 3], position[v * 3 + 2]);
      expect(r).toBeGreaterThan(PIN_RADIUS * 0.97);
      expect(r).toBeLessThan(PIN_RADIUS * 1.001);
    }
  });

  test("an off-centre cut is thinner: r^2 = R^2 - d^2", () => {
    const shape = skittleShape();
    const hidden = PIN_RADIUS * 0.6;
    const expected = Math.sqrt(PIN_RADIUS ** 2 - hidden ** 2);
    const { slice, position, face } = cut(shape, hidden);
    expect(slice.triangles).toBeGreaterThan(50);
    for (let v = 0; v < slice.triangles * 3; v++) {
      if (face[v] !== 0) continue;
      const r = Math.hypot(position[v * 3], position[v * 3 + 2]);
      expect(r).toBeGreaterThan(expected * 0.94);
      expect(r).toBeLessThan(expected * 1.01);
    }
  });

  test("a pin beyond its radius is not in the slice", () => {
    expect(cut(pinShape(), PIN_RADIUS * 1.05).slice.triangles).toBe(0);
  });

  test("a pin that lies along the hidden direction shows as a ball", () => {
    const shape = skittleShape();
    // Turn the axis (Y) into W: the slice then cuts across the axis.
    const { slice, position } = cut(shape, 0, mulMM(planeRotation(1, 3, Math.PI / 2), shape.P));
    expect(slice.triangles).toBeGreaterThan(100);
    for (let v = 0; v < slice.triangles * 3; v++) {
      const r = Math.hypot(position[v * 3], position[v * 3 + 1], position[v * 3 + 2]);
      expect(r).toBeGreaterThan(PIN_RADIUS * 0.95);
      expect(r).toBeLessThan(PIN_RADIUS * 1.001);
    }
  });

  test("every triangle faces along its surface normal", () => {
    for (const hidden of [0, PIN_RADIUS * 0.3]) {
      const { slice, position, normal } = cut(pinShape(), hidden);
      for (let t = 0; t < slice.triangles; t++) {
        const p = (i: number, c: number): number => position[(t * 3 + i) * 3 + c];
        const ax = p(1, 0) - p(0, 0);
        const ay = p(1, 1) - p(0, 1);
        const az = p(1, 2) - p(0, 2);
        const bx = p(2, 0) - p(0, 0);
        const by = p(2, 1) - p(0, 1);
        const bz = p(2, 2) - p(0, 2);
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const area = Math.hypot(nx, ny, nz);
        if (area < 1e-8) continue; // a sliver below a hundredth of a square millimetre
        let facing = 0;
        for (let i = 0; i < 3; i++) {
          const o = (t * 3 + i) * 3;
          facing += nx * normal[o] + ny * normal[o + 1] + nz * normal[o + 2];
        }
        expect(facing).toBeGreaterThan(0);
      }
    }
  });
});
