// Turns a 4D solid into the 3D mesh that one slice of space shows.
//
// The surface of a 4D solid is three-dimensional. It is stored as tetrahedra. A slice
// (a 3D hyperplane) cuts each tetrahedron in a triangle or a quad. The cut is done on
// the CPU every frame, so the result is an ordinary lit, shadow-casting mesh.

import * as THREE from "three";
import { icosphere, type Mat4 } from "../math4";
import type { Shape } from "../physics/shape";

/** Boundary of a shape as tetrahedra, in the body frame. */
export interface TetMesh {
  /** 4 floats per vertex. */
  positions: Float32Array;
  normals: Float32Array;
  /** Shape-frame coordinates, for texturing. */
  locals: Float32Array;
  /** 4 vertex indices per tetrahedron. */
  tets: Uint32Array;
  /** Surface of each tetrahedron: 0 = side, 1 = base, 2 = top. */
  faces: Uint8Array;
}

export const buildTetMesh = (shape: Shape, level = 2): TetMesh => {
  const { points, faces: tris } = icosphere(level);
  const r = shape.radius;
  const yBottom = -shape.height / 2;
  const k = shape.bevel;
  const topNorm = Math.sqrt(1 + k * k);
  const positions: number[] = [];
  const normals: number[] = [];
  const locals: number[] = [];
  const tets: number[] = [];
  const faces: number[] = [];

  const vertex = (local: number[], normal: number[]): number => {
    const p = shape.toBody(local as [number, number, number, number]);
    // Normals rotate with P^T, the same rotation that takes shape to body.
    const origin = shape.toBody([0, 0, 0, 0]);
    const tip = shape.toBody(normal as [number, number, number, number]);
    positions.push(...p);
    normals.push(tip[0] - origin[0], tip[1] - origin[1], tip[2] - origin[2], tip[3] - origin[3]);
    locals.push(...local);
    return positions.length / 4 - 1;
  };
  const ring = (u: number[], y: number): number[] => [r * u[0], y, r * u[1], r * u[2]];
  const topY = (u: number[]): number => shape.topAt(r * u[1]);

  // Side: one prism per sphere triangle, split in three tetrahedra.
  const sideBottom = points.map((u) => vertex(ring(u, yBottom), [u[0], 0, u[1], u[2]]));
  const sideTop = points.map((u) => vertex(ring(u, topY(u)), [u[0], 0, u[1], u[2]]));
  for (const [a, b, c] of tris) {
    tets.push(sideBottom[a], sideBottom[b], sideBottom[c], sideTop[a]);
    tets.push(sideBottom[b], sideBottom[c], sideTop[a], sideTop[b]);
    tets.push(sideBottom[c], sideTop[a], sideTop[b], sideTop[c]);
    faces.push(0, 0, 0);
  }
  // Base: a cone of tetrahedra from the centre of the ball.
  const down = [0, -1, 0, 0];
  const baseRing = points.map((u) => vertex(ring(u, yBottom), down));
  const baseCenter = vertex([0, yBottom, 0, 0], down);
  // Top: the same, on the slanted cut.
  const up = [0, 1 / topNorm, k / topNorm, 0];
  const topRing = points.map((u) => vertex(ring(u, topY(u)), up));
  const topCenter = vertex([0, shape.topAt(0), 0, 0], up);
  for (const [a, b, c] of tris) {
    tets.push(baseCenter, baseRing[a], baseRing[b], baseRing[c]);
    faces.push(1);
    tets.push(topCenter, topRing[a], topRing[b], topRing[c]);
    faces.push(2);
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    locals: new Float32Array(locals),
    tets: new Uint32Array(tets),
    faces: new Uint8Array(faces),
  };
};

/** A mesh geometry that is re-cut from a `TetMesh` whenever the body or the slice moves. */
export class SliceGeometry {
  readonly geometry = new THREE.BufferGeometry();
  /** Triangles produced by the last cut. */
  triangles = 0;
  private readonly position: Float32Array;
  private readonly normal: Float32Array;
  private readonly local: Float32Array;
  private readonly face: Float32Array;
  /** Slice-space vertices: xyz in the slice, w = distance from it. */
  private readonly sp: Float32Array;
  private readonly sn: Float32Array;

  constructor(private readonly mesh: TetMesh) {
    const maxVertices = (mesh.tets.length / 4) * 6;
    this.position = new Float32Array(maxVertices * 3);
    this.normal = new Float32Array(maxVertices * 3);
    this.local = new Float32Array(maxVertices * 4);
    this.face = new Float32Array(maxVertices);
    this.sp = new Float32Array(mesh.positions.length);
    this.sn = new Float32Array(mesh.positions.length);
    const dynamic = (array: Float32Array, size: number): THREE.BufferAttribute => {
      const attribute = new THREE.BufferAttribute(array, size);
      attribute.setUsage(THREE.DynamicDrawUsage);
      return attribute;
    };
    this.geometry.setAttribute("position", dynamic(this.position, 3));
    this.geometry.setAttribute("normal", dynamic(this.normal, 3));
    this.geometry.setAttribute("aLocal", dynamic(this.local, 4));
    this.geometry.setAttribute("aFace", dynamic(this.face, 1));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  }

  /**
   * Cut the mesh. `m` and `t` take body coordinates to slice coordinates (row-major 4x4
   * and translation); the fourth slice coordinate is the distance from the slice.
   * `offset` moves the cut along that coordinate.
   */
  update(m: Mat4, t: ArrayLike<number>, offset: number): void {
    const { positions, normals, locals, tets, faces } = this.mesh;
    const sp = this.sp;
    const sn = this.sn;
    for (let i = 0; i < positions.length; i += 4) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const w = positions[i + 3];
      sp[i] = m[0] * x + m[1] * y + m[2] * z + m[3] * w + t[0];
      sp[i + 1] = m[4] * x + m[5] * y + m[6] * z + m[7] * w + t[1];
      sp[i + 2] = m[8] * x + m[9] * y + m[10] * z + m[11] * w + t[2];
      sp[i + 3] = m[12] * x + m[13] * y + m[14] * z + m[15] * w + t[3] - offset;
      const nx = normals[i];
      const ny = normals[i + 1];
      const nz = normals[i + 2];
      const nw = normals[i + 3];
      sn[i] = m[0] * nx + m[1] * ny + m[2] * nz + m[3] * nw;
      sn[i + 1] = m[4] * nx + m[5] * ny + m[6] * nz + m[7] * nw;
      sn[i + 2] = m[8] * nx + m[9] * ny + m[10] * nz + m[11] * nw;
    }

    const P = this.position;
    const N = this.normal;
    const L = this.local;
    const F = this.face;
    let v = 0; // output vertex count
    const cut = new Int32Array(8); // edge endpoints of up to 4 cut points
    for (let ti = 0; ti < tets.length; ti += 4) {
      // Sort the four corners by side of the slice.
      let above = 0;
      let mask = 0;
      for (let c = 0; c < 4; c++) {
        if (sp[tets[ti + c] * 4 + 3] > 0) {
          above++;
          mask |= 1 << c;
        }
      }
      if (above === 0 || above === 4) continue;
      let count = 0;
      if (above === 2) {
        let h0 = -1;
        let h1 = -1;
        let l0 = -1;
        let l1 = -1;
        for (let c = 0; c < 4; c++) {
          const index = tets[ti + c];
          if (mask & (1 << c)) {
            if (h0 < 0) h0 = index;
            else h1 = index;
          } else if (l0 < 0) l0 = index;
          else l1 = index;
        }
        // Quad in ring order.
        cut[0] = h0;
        cut[1] = l0;
        cut[2] = h0;
        cut[3] = l1;
        cut[4] = h1;
        cut[5] = l1;
        cut[6] = h1;
        cut[7] = l0;
        count = 4;
      } else {
        const lone = above === 1 ? mask : ~mask & 15;
        let apex = 0;
        for (let c = 0; c < 4; c++) if (lone === 1 << c) apex = c;
        let e = 0;
        for (let c = 0; c < 4; c++) {
          if (c === apex) continue;
          cut[e++] = tets[ti + apex];
          cut[e++] = tets[ti + c];
        }
        count = 3;
      }
      // Cut points.
      const base = v;
      for (let e = 0; e < count; e++) {
        const a = cut[2 * e] * 4;
        const b = cut[2 * e + 1] * 4;
        const f = sp[a + 3] / (sp[a + 3] - sp[b + 3]);
        const o = v + e;
        P[o * 3] = sp[a] + (sp[b] - sp[a]) * f;
        P[o * 3 + 1] = sp[a + 1] + (sp[b + 1] - sp[a + 1]) * f;
        P[o * 3 + 2] = sp[a + 2] + (sp[b + 2] - sp[a + 2]) * f;
        let nx = sn[a] + (sn[b] - sn[a]) * f;
        let ny = sn[a + 1] + (sn[b + 1] - sn[a + 1]) * f;
        let nz = sn[a + 2] + (sn[b + 2] - sn[a + 2]) * f;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;
        N[o * 3] = nx;
        N[o * 3 + 1] = ny;
        N[o * 3 + 2] = nz;
        for (let c = 0; c < 4; c++)
          L[o * 4 + c] = locals[a + c] + (locals[b + c] - locals[a + c]) * f;
        F[o] = faces[ti / 4];
      }
      // Wind the polygon to face along the surface normal. A quad uses its diagonals:
      // two of its corners coincide when the slice passes through a mesh vertex, and
      // then one of its triangles has no area.
      const i1 = count === 4 ? base + 2 : base + 1;
      const j0 = count === 4 ? base + 1 : base;
      const j1 = count === 4 ? base + 3 : base + 2;
      const ax = P[i1 * 3] - P[base * 3];
      const ay = P[i1 * 3 + 1] - P[base * 3 + 1];
      const az = P[i1 * 3 + 2] - P[base * 3 + 2];
      const bx = P[j1 * 3] - P[j0 * 3];
      const by = P[j1 * 3 + 1] - P[j0 * 3 + 1];
      const bz = P[j1 * 3 + 2] - P[j0 * 3 + 2];
      let mx = 0;
      let my = 0;
      let mz = 0;
      for (let e = 0; e < count; e++) {
        mx += N[(base + e) * 3];
        my += N[(base + e) * 3 + 1];
        mz += N[(base + e) * 3 + 2];
      }
      const facing = (ay * bz - az * by) * mx + (az * bx - ax * bz) * my + (ax * by - ay * bx) * mz;
      if (count === 3) {
        if (facing < 0) this.swap(base + 1, base + 2);
        v += 3;
      } else {
        // Quad 0 1 2 3 -> triangles 0 1 2 and 0 2 3.
        this.copy(base + 3, base + 5);
        this.copy(base + 2, base + 4);
        this.copy(base, base + 3);
        if (facing < 0) {
          this.swap(base + 1, base + 2);
          this.swap(base + 4, base + 5);
        }
        v += 6;
      }
    }
    this.triangles = v / 3;
    this.geometry.setDrawRange(0, v);
    for (const name of ["position", "normal", "aLocal", "aFace"]) {
      const attribute = this.geometry.getAttribute(name) as THREE.BufferAttribute;
      attribute.clearUpdateRanges();
      attribute.addUpdateRange(0, v * attribute.itemSize);
      attribute.needsUpdate = true;
    }
  }

  private copy(from: number, to: number): void {
    const P = this.position;
    const N = this.normal;
    const L = this.local;
    for (let c = 0; c < 3; c++) {
      P[to * 3 + c] = P[from * 3 + c];
      N[to * 3 + c] = N[from * 3 + c];
    }
    for (let c = 0; c < 4; c++) L[to * 4 + c] = L[from * 4 + c];
    this.face[to] = this.face[from];
  }

  private swap(a: number, b: number): void {
    const P = this.position;
    const N = this.normal;
    const L = this.local;
    for (let c = 0; c < 3; c++) {
      let s = P[a * 3 + c];
      P[a * 3 + c] = P[b * 3 + c];
      P[b * 3 + c] = s;
      s = N[a * 3 + c];
      N[a * 3 + c] = N[b * 3 + c];
      N[b * 3 + c] = s;
    }
    for (let c = 0; c < 4; c++) {
      const s = L[a * 4 + c];
      L[a * 4 + c] = L[b * 4 + c];
      L[b * 4 + c] = s;
    }
    const s = this.face[a];
    this.face[a] = this.face[b];
    this.face[b] = s;
  }
}
