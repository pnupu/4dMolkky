// Four-dimensional vector, rotation and bivector maths.
// Axes: 0 = X, 1 = Y (up), 2 = Z, 3 = W.

export type Vec4 = [number, number, number, number];
/** Row-major 4x4 matrix. */
export type Mat4 = Float64Array;
/** Antisymmetric 4x4 matrix stored as its upper triangle: xy, xz, xw, yz, yw, zw. */
export type Biv = [number, number, number, number, number, number];

export const vec = (x = 0, y = 0, z = 0, w = 0): Vec4 => [x, y, z, w];
export const add = (a: Vec4, b: Vec4): Vec4 => [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
export const sub = (a: Vec4, b: Vec4): Vec4 => [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
export const scale = (a: Vec4, s: number): Vec4 => [a[0] * s, a[1] * s, a[2] * s, a[3] * s];
export const addScaled = (a: Vec4, b: Vec4, s: number): Vec4 => [
  a[0] + b[0] * s,
  a[1] + b[1] * s,
  a[2] + b[2] * s,
  a[3] + b[3] * s,
];
export const dot = (a: Vec4, b: Vec4): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
export const len = (a: Vec4): number => Math.sqrt(dot(a, a));
export const dist = (a: Vec4, b: Vec4): number => len(sub(a, b));
export const normalize = (a: Vec4): Vec4 => {
  const l = len(a);
  return l > 1e-12 ? scale(a, 1 / l) : [0, 0, 0, 0];
};

export const identity = (): Mat4 => {
  const m = new Float64Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
};

/** m * v */
export const mulMV = (m: Mat4, v: Vec4): Vec4 => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3],
  m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3],
  m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3],
  m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3],
];

/** transpose(m) * v */
export const mulTV = (m: Mat4, v: Vec4): Vec4 => [
  m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
  m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
  m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
  m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
];

export const mulMM = (a: Mat4, b: Mat4): Mat4 => {
  const o = new Float64Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      o[4 * i + j] =
        a[4 * i] * b[j] +
        a[4 * i + 1] * b[4 + j] +
        a[4 * i + 2] * b[8 + j] +
        a[4 * i + 3] * b[12 + j];
    }
  }
  return o;
};

export const transpose = (m: Mat4): Mat4 => {
  const o = new Float64Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) o[4 * i + j] = m[4 * j + i];
  return o;
};

/** Column `j` of `m` as a vector. */
export const column = (m: Mat4, j: number): Vec4 => [m[j], m[4 + j], m[8 + j], m[12 + j]];

/** Rotation by `angle` that turns axis `i` toward axis `j`. */
export const planeRotation = (i: number, j: number, angle: number): Mat4 => {
  const m = identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  m[4 * i + i] = c;
  m[4 * j + j] = c;
  m[4 * j + i] = s;
  m[4 * i + j] = -s;
  return m;
};

/** Gram-Schmidt on the columns, in place. Keeps a rotation matrix a rotation. */
export const orthonormalize = (m: Mat4): void => {
  for (let j = 0; j < 4; j++) {
    for (let k = 0; k < j; k++) {
      const d = m[j] * m[k] + m[4 + j] * m[4 + k] + m[8 + j] * m[8 + k] + m[12 + j] * m[12 + k];
      for (let i = 0; i < 4; i++) m[4 * i + j] -= d * m[4 * i + k];
    }
    const l = Math.hypot(m[j], m[4 + j], m[8 + j], m[12 + j]);
    for (let i = 0; i < 4; i++) m[4 * i + j] /= l;
  }
};

// --- Bivectors -----------------------------------------------------------------
// A bivector B acts on a vector as the antisymmetric matrix with B[i][j] for i < j
// in the order xy, xz, xw, yz, yw, zw. Angular velocity W gives point velocity W r.

export const biv = (): Biv => [0, 0, 0, 0, 0, 0];

/** a b^T - b a^T. The torque of force `a` applied at offset `b`. */
export const wedge = (a: Vec4, b: Vec4): Biv => [
  a[0] * b[1] - b[0] * a[1],
  a[0] * b[2] - b[0] * a[2],
  a[0] * b[3] - b[0] * a[3],
  a[1] * b[2] - b[1] * a[2],
  a[1] * b[3] - b[1] * a[3],
  a[2] * b[3] - b[2] * a[3],
];

/** B r */
export const bivApply = (b: Biv, r: Vec4): Vec4 => [
  b[0] * r[1] + b[1] * r[2] + b[2] * r[3],
  -b[0] * r[0] + b[3] * r[2] + b[4] * r[3],
  -b[1] * r[0] - b[3] * r[1] + b[5] * r[3],
  -b[2] * r[0] - b[4] * r[1] - b[5] * r[2],
];

export const bivNorm = (b: Biv): number =>
  Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2] + b[3] * b[3] + b[4] * b[4] + b[5] * b[5]);

const bivToMatrix = (b: Biv): Mat4 => {
  const m = new Float64Array(16);
  m[1] = b[0];
  m[2] = b[1];
  m[3] = b[2];
  m[6] = b[3];
  m[7] = b[4];
  m[11] = b[5];
  m[4] = -b[0];
  m[8] = -b[1];
  m[12] = -b[2];
  m[9] = -b[3];
  m[13] = -b[4];
  m[14] = -b[5];
  return m;
};

const matrixToBiv = (m: Mat4): Biv => [m[1], m[2], m[3], m[6], m[7], m[11]];

/** R^T B R: a world-frame bivector expressed in the body frame of rotation R. */
export const bivToBody = (r: Mat4, b: Biv): Biv =>
  matrixToBiv(mulMM(transpose(r), mulMM(bivToMatrix(b), r)));

/** R B R^T: a body-frame bivector expressed in the world frame. */
export const bivToWorld = (r: Mat4, b: Biv): Biv =>
  matrixToBiv(mulMM(r, mulMM(bivToMatrix(b), transpose(r))));

/** R <- exp(W dt) R, second order, then re-orthonormalised. */
export const integrateRotation = (r: Mat4, omega: Biv, dt: number): void => {
  const a = bivToMatrix(omega);
  for (let i = 0; i < 16; i++) a[i] *= dt;
  const a2 = mulMM(a, a);
  const step = identity();
  for (let i = 0; i < 16; i++) step[i] += a[i] + 0.5 * a2[i];
  r.set(mulMM(step, r));
  orthonormalize(r);
};

/** Eigen-decomposition of a symmetric 4x4 matrix by cyclic Jacobi rotations. */
export const jacobiEigen = (input: number[][]): { values: number[]; vectors: Mat4 } => {
  const a = input.map((row) => [...row]);
  const v = identity();
  for (let sweep = 0; sweep < 32; sweep++) {
    let off = 0;
    for (let p = 0; p < 4; p++) for (let q = p + 1; q < 4; q++) off += a[p][q] * a[p][q];
    if (off < 1e-30) break;
    for (let p = 0; p < 4; p++) {
      for (let q = p + 1; q < 4; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < 4; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < 4; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < 4; k++) {
          const vkp = v[4 * k + p];
          const vkq = v[4 * k + q];
          v[4 * k + p] = c * vkp - s * vkq;
          v[4 * k + q] = s * vkp + c * vkq;
        }
      }
    }
  }
  return { values: [a[0][0], a[1][1], a[2][2], a[3][3]], vectors: v };
};

export type Vec3 = [number, number, number];

/** Unit 2-sphere points and triangles from a subdivided icosahedron. */
export const icosphere = (level: number): { points: Vec3[]; faces: Vec3[] } => {
  const t = (1 + Math.sqrt(5)) / 2;
  let points: Vec3[] = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ];
  let faces: Vec3[] = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];
  const unit = (p: Vec3): Vec3 => {
    const l = Math.hypot(p[0], p[1], p[2]);
    return [p[0] / l, p[1] / l, p[2] / l];
  };
  points = points.map(unit);
  for (let l = 0; l < level; l++) {
    const cache = new Map<number, number>();
    const mid = (i: number, j: number): number => {
      const key = i < j ? i * 100000 + j : j * 100000 + i;
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      const a = points[i];
      const b = points[j];
      points.push(unit([a[0] + b[0], a[1] + b[1], a[2] + b[2]]));
      cache.set(key, points.length - 1);
      return points.length - 1;
    };
    const next: Vec3[] = [];
    for (const [a, b, c] of faces) {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }
  return { points, faces };
};
