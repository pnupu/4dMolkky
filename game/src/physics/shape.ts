// Collision shape for pins and the throwing skittle.
//
// A 4D pin is a spherinder: a solid 3-ball (in x, z, w) extruded along its axis (y).
// Its flat base is a ball, so it stands on the 3D ground of a 4D world. The top can be
// cut by a slanted hyperplane, like the 45 degree number face of a real Mölkky pin.
//
// Shape frame: axis = +Y, centred on the uncut cylinder. The slanted top is lowest at +Z.
// Body frame: origin at the centre of mass, axes along the principal axes of inertia.

import {
  type Biv,
  dot,
  icosphere,
  jacobiEigen,
  type Mat4,
  mulMV,
  mulTV,
  sub,
  type Vec4,
} from "../math4";

export interface ShapeSpec {
  radius: number;
  /** Height on the tall side. */
  height: number;
  /** Slope of the top cut (tan of its angle). 0 gives a flat top. */
  bevel: number;
  mass: number;
}

/** A rim is the image of a unit 2-sphere: base + u0 a[0] + u1 a[1] + u2 a[2]. Body frame. */
export interface Rim {
  base: Vec4;
  a: [Vec4, Vec4, Vec4];
  radius: number;
  /** 42 fixed points, used against other bodies. */
  samples: Vec4[];
  /** 12 fixed points, used against the ground. */
  groundSamples: Vec4[];
}

export class Shape {
  readonly radius: number;
  readonly height: number;
  readonly bevel: number;
  readonly mass: number;
  readonly invMass: number;
  /** Per-plane inverse inertia in the body frame. */
  readonly invInertia: Biv;
  /** Centre of mass in the shape frame. */
  readonly com: Vec4;
  /** Columns are the body axes in the shape frame: p_shape = P p_body + com. */
  readonly P: Mat4;
  readonly rims: Rim[];
  /** Axis segment under the full lateral surface, body frame. */
  readonly axisA: Vec4;
  readonly axisB: Vec4;
  /** Unit axis (shape +Y) in the body frame. */
  readonly axisDir: Vec4;
  /** Centre of the flat base in the body frame. */
  readonly baseCenter: Vec4;
  readonly boundRadius: number;
  private readonly topNorm: number;
  /** Outputs of the last `sdf` call: the nearest surface, and the distance to the used one. */
  face = 0;
  faceDistance = 0;

  constructor(spec: ShapeSpec) {
    this.radius = spec.radius;
    this.height = spec.height;
    this.bevel = spec.bevel;
    this.mass = spec.mass;
    this.invMass = 1 / spec.mass;
    this.topNorm = Math.sqrt(1 + spec.bevel * spec.bevel);

    const { com, second } = this.massProperties();
    this.com = com;
    const eig = jacobiEigen(second);
    this.P = eig.vectors;
    const s = eig.values;
    this.invInertia = [
      1 / (s[0] + s[1]),
      1 / (s[0] + s[2]),
      1 / (s[0] + s[3]),
      1 / (s[1] + s[2]),
      1 / (s[1] + s[3]),
      1 / (s[2] + s[3]),
    ];

    const r = this.radius;
    const hh = this.height / 2;
    const k = this.bevel;
    const ground = icosphere(0).points;
    const dense = icosphere(1).points;
    const makeRim = (base: Vec4, a: [Vec4, Vec4, Vec4]): Rim => {
      const at = (u: [number, number, number]): Vec4 =>
        this.toBody([
          base[0] + u[0] * a[0][0] + u[1] * a[1][0] + u[2] * a[2][0],
          base[1] + u[0] * a[0][1] + u[1] * a[1][1] + u[2] * a[2][1],
          base[2] + u[0] * a[0][2] + u[1] * a[1][2] + u[2] * a[2][2],
          base[3] + u[0] * a[0][3] + u[1] * a[1][3] + u[2] * a[2][3],
        ]);
      const dir = (v: Vec4): Vec4 => mulTV(this.P, v);
      return {
        base: this.toBody(base),
        a: [dir(a[0]), dir(a[1]), dir(a[2])],
        radius: r * this.topNorm,
        samples: dense.map(at),
        groundSamples: ground.map(at),
      };
    };
    this.rims = [
      makeRim(
        [0, -hh, 0, 0],
        [
          [r, 0, 0, 0],
          [0, 0, r, 0],
          [0, 0, 0, r],
        ],
      ),
      // Top rim: y = hh - k (z + r) on the sphere of radius r.
      makeRim(
        [0, hh - k * r, 0, 0],
        [
          [r, 0, 0, 0],
          [0, -k * r, r, 0],
          [0, 0, 0, r],
        ],
      ),
    ];
    this.axisA = this.toBody([0, -hh, 0, 0]);
    this.axisB = this.toBody([0, hh - 2 * k * r, 0, 0]);
    this.axisDir = mulTV(this.P, [0, 1, 0, 0]);
    this.baseCenter = this.toBody([0, -hh, 0, 0]);
    let bound = 0;
    for (const rim of this.rims)
      for (const p of rim.samples) bound = Math.max(bound, Math.sqrt(dot(p, p)));
    this.boundRadius = bound * 1.02;
  }

  /** Shape-frame point to body frame. */
  toBody(p: Vec4): Vec4 {
    return mulTV(this.P, sub(p, this.com));
  }

  /** Body-frame point to shape frame. */
  toShape(p: Vec4): Vec4 {
    const q = mulMV(this.P, p);
    return [q[0] + this.com[0], q[1] + this.com[1], q[2] + this.com[2], q[3] + this.com[3]];
  }

  /** Height of the top surface above the shape origin at ball coordinate z. */
  topAt(z: number): number {
    return this.height / 2 - this.bevel * (z + this.radius);
  }

  /**
   * Signed distance in the shape frame, exact inside the solid. Writes the unit outward
   * gradient to `grad`.
   *
   * The solid has three bounding surfaces: 0 = side, 1 = base, 2 = top. With `face` < 0
   * the nearest one sets the gradient. With `face` given, that surface sets the gradient
   * and `faceDistance`, while the return value stays the true distance.
   */
  sdf(p: Vec4, grad: Vec4, face = -1): number {
    const rho = Math.sqrt(p[0] * p[0] + p[2] * p[2] + p[3] * p[3]);
    const dSide = rho - this.radius;
    const dBottom = -this.height / 2 - p[1];
    const dTop = (p[1] - this.topAt(p[2])) / this.topNorm;
    const nearest = dSide >= dBottom && dSide >= dTop ? 0 : dBottom >= dTop ? 1 : 2;
    const use = face < 0 ? nearest : face;
    this.face = nearest;
    if (use === 0) {
      if (rho > 1e-9) {
        grad[0] = p[0] / rho;
        grad[1] = 0;
        grad[2] = p[2] / rho;
        grad[3] = p[3] / rho;
      } else {
        grad[0] = 1;
        grad[1] = grad[2] = grad[3] = 0;
      }
      this.faceDistance = dSide;
    } else if (use === 1) {
      grad[0] = grad[2] = grad[3] = 0;
      grad[1] = -1;
      this.faceDistance = dBottom;
    } else {
      grad[0] = grad[3] = 0;
      grad[1] = 1 / this.topNorm;
      grad[2] = this.bevel / this.topNorm;
      this.faceDistance = dTop;
    }
    return Math.max(dSide, dBottom, dTop);
  }

  /** Centre of mass and second-moment matrix about it, by a grid over the ball. */
  private massProperties(): { com: Vec4; second: number[][] } {
    const n = 48;
    const r = this.radius;
    const yb = -this.height / 2;
    let m0 = 0;
    const first = [0, 0, 0, 0];
    const raw = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < n; i++) {
      const x = (-1 + (2 * i + 1) / n) * r;
      for (let j = 0; j < n; j++) {
        const z = (-1 + (2 * j + 1) / n) * r;
        for (let l = 0; l < n; l++) {
          const w = (-1 + (2 * l + 1) / n) * r;
          if (x * x + z * z + w * w > r * r) continue;
          const yt = this.topAt(z);
          const length = yt - yb;
          const y1 = (yt * yt - yb * yb) / 2;
          const y2 = (yt * yt * yt - yb * yb * yb) / 3;
          m0 += length;
          const c = [x, 0, z, w];
          first[0] += x * length;
          first[1] += y1;
          first[2] += z * length;
          first[3] += w * length;
          for (const a of [0, 2, 3]) {
            for (const b of [0, 2, 3]) raw[a][b] += c[a] * c[b] * length;
            raw[a][1] += c[a] * y1;
            raw[1][a] += c[a] * y1;
          }
          raw[1][1] += y2;
        }
      }
    }
    const com = first.map((v) => v / m0) as Vec4;
    const density = this.mass / m0;
    const second = raw.map((row, a) => row.map((v, b) => (v - m0 * com[a] * com[b]) * density));
    return { com, second };
  }
}
