// Four-dimensional rigid-body simulation for pins and the throwing skittle.
//
// Bodies rotate with a 4x4 rotation matrix and a bivector angular velocity. Contacts come
// from rim points tested against the other body's signed distance, plus an exact
// side-to-side test on the axis segments. A sequential-impulse solver runs on small
// substeps. The ground is the hyperplane y = 0.

import {
  add,
  addScaled,
  type Biv,
  biv,
  bivApply,
  bivNorm,
  dot,
  identity,
  integrateRotation,
  len,
  type Mat4,
  mulMM,
  mulMV,
  mulTV,
  scale,
  sub,
  transpose,
  type Vec4,
  wedge,
} from "../math4";
import type { Rim, Shape } from "./shape";

export class Body {
  pos: Vec4 = [0, 0, 0, 0];
  rot: Mat4 = identity();
  vel: Vec4 = [0, 0, 0, 0];
  omega: Biv = biv();
  asleep = false;
  quietTime = 0;
  grounded = false;
  /** Shape-frame point = shapeFromWorld * (world - pos) + com. Refreshed each substep. */
  shapeFromWorld: Mat4 = identity();
  /** Rotation acting on bivectors: world = bivRot * body. Row-major 6x6. */
  private readonly bivRot = new Float64Array(36);
  private readonly scratchLocal: Vec4 = [0, 0, 0, 0];
  private readonly scratchGrad: Vec4 = [0, 0, 0, 0];
  private samples: Vec4[][] = [];
  private samplesStale = true;

  constructor(
    readonly id: number,
    readonly shape: Shape,
  ) {}

  /** Call after `rot` changes: updates the cached world transforms. */
  refresh(): void {
    this.samplesStale = true;
    this.shapeFromWorld = mulMM(this.shape.P, transpose(this.rot));
    const r = this.rot;
    const t = this.bivRot;
    for (let m = 0; m < 6; m++) {
      const [a, b] = PLANES[m];
      for (let n = 0; n < 6; n++) {
        const [i, j] = PLANES[n];
        t[6 * m + n] = r[4 * a + i] * r[4 * b + j] - r[4 * a + j] * r[4 * b + i];
      }
    }
  }

  toWorld(bodyPoint: Vec4): Vec4 {
    return add(mulMV(this.rot, bodyPoint), this.pos);
  }

  /** Unit axis (base to top) in the world. */
  axis(): Vec4 {
    return mulMV(this.rot, this.shape.axisDir);
  }

  /** Velocity of the body point at world offset `r` from the centre of mass. */
  velocityAt(r: Vec4): Vec4 {
    return add(this.vel, bivApply(this.omega, r));
  }

  /** World bivector -> body frame, scaled per plane, -> world frame. */
  private scaledInBody(l: Biv, invert: boolean): Biv {
    const t = this.bivRot;
    const inv = this.shape.invInertia;
    const body = [0, 0, 0, 0, 0, 0];
    for (let n = 0; n < 6; n++) {
      let v = 0;
      for (let m = 0; m < 6; m++) v += t[6 * m + n] * l[m];
      body[n] = invert ? v / inv[n] : v * inv[n];
    }
    const out = biv();
    for (let m = 0; m < 6; m++) {
      let v = 0;
      for (let n = 0; n < 6; n++) v += t[6 * m + n] * body[n];
      out[m] = v;
    }
    return out;
  }

  /** World angular velocity change for a world angular impulse. */
  invInertiaWorld(l: Biv): Biv {
    return this.scaledInBody(l, false);
  }

  angularMomentum(): Biv {
    return this.scaledInBody(this.omega, true);
  }

  kineticEnergy(): number {
    const l = this.angularMomentum();
    let e = 0.5 * this.shape.mass * dot(this.vel, this.vel);
    for (let k = 0; k < 6; k++) e += 0.5 * l[k] * this.omega[k];
    return e;
  }

  /**
   * Signed distance of a world point to this body. Writes the world gradient. `face`
   * selects the bounding surface for the gradient, as in `Shape.sdf`.
   */
  sdfWorld(p: Vec4, grad: Vec4, face = -1): number {
    const m = this.shapeFromWorld;
    const c = this.shape.com;
    const x = p[0] - this.pos[0];
    const y = p[1] - this.pos[1];
    const z = p[2] - this.pos[2];
    const w = p[3] - this.pos[3];
    const local = this.scratchLocal;
    local[0] = m[0] * x + m[1] * y + m[2] * z + m[3] * w + c[0];
    local[1] = m[4] * x + m[5] * y + m[6] * z + m[7] * w + c[1];
    local[2] = m[8] * x + m[9] * y + m[10] * z + m[11] * w + c[2];
    local[3] = m[12] * x + m[13] * y + m[14] * z + m[15] * w + c[3];
    const g = this.scratchGrad;
    const d = this.shape.sdf(local, g, face);
    grad[0] = m[0] * g[0] + m[4] * g[1] + m[8] * g[2] + m[12] * g[3];
    grad[1] = m[1] * g[0] + m[5] * g[1] + m[9] * g[2] + m[13] * g[3];
    grad[2] = m[2] * g[0] + m[6] * g[1] + m[10] * g[2] + m[14] * g[3];
    grad[3] = m[3] * g[0] + m[7] * g[1] + m[11] * g[2] + m[15] * g[3];
    return d;
  }

  /** World positions of the rim samples, per rim. Valid until the body moves. */
  rimSamplesWorld(): Vec4[][] {
    if (this.samplesStale) {
      this.samplesStale = false;
      this.samples = this.shape.rims.map((rim) => rim.samples.map((s) => this.toWorld(s)));
    }
    return this.samples;
  }

  /** A measure of motion in m/s, for sleeping. */
  motion(): number {
    return len(this.vel) + bivNorm(this.omega) * this.shape.boundRadius;
  }

  wake(): void {
    this.asleep = false;
    this.quietTime = 0;
  }
}

interface Contact {
  a: Body;
  /** Null for the ground. */
  b: Body | null;
  point: Vec4;
  /** Unit normal from b toward a. */
  normal: Vec4;
  depth: number;
  ra: Vec4;
  rb: Vec4;
  tangents: [Vec4, Vec4, Vec4];
  angA: Biv[];
  angB: Biv[];
  mass: number[];
  bias: number;
  lambdaN: number;
  lambdaT: [number, number, number];
  friction: number;
}

/** A collision loud enough to hear. */
export interface Impact {
  point: Vec4;
  /** Normal impulse in N s. */
  strength: number;
  ground: boolean;
  bodyA: number;
  bodyB: number;
}

const PLANES = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];
const MARGIN = 0.002;
const SLOP = 0.0005;

export class World {
  bodies: Body[] = [];
  gravity = 9.81;
  substeps = 8;
  iterations = 2;
  time = 0;
  /** Impacts from the last `step`, strongest per body pair. */
  impacts: Impact[] = [];
  /** Deepest penetration seen in the last `step`, in metres. */
  maxPenetration = 0;

  private contacts: Contact[] = [];
  private nextId = 0;
  /** Length of the current substep. */
  private h = 0;

  addBody(shape: Shape): Body {
    const body = new Body(this.nextId++, shape);
    this.bodies.push(body);
    return body;
  }

  removeBody(body: Body): void {
    this.bodies = this.bodies.filter((b) => b !== body);
  }

  allAsleep(): boolean {
    return this.bodies.every((b) => b.asleep);
  }

  step(dt: number): void {
    this.impacts = [];
    this.maxPenetration = 0;
    const h = dt / this.substeps;
    for (const b of this.bodies) b.refresh();
    for (let s = 0; s < this.substeps; s++) this.substep(h);
    this.time += dt;
  }

  private substep(h: number): void {
    this.h = h;
    for (const b of this.bodies) if (!b.asleep) b.vel[1] -= this.gravity * h;

    this.contacts = [];
    for (const b of this.bodies) {
      b.grounded = false;
      if (!b.asleep) this.groundContacts(b);
    }
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const a = this.bodies[i];
        const b = this.bodies[j];
        if (a.asleep && b.asleep) continue;
        const reach = a.shape.boundRadius + b.shape.boundRadius + MARGIN;
        const d = sub(a.pos, b.pos);
        if (dot(d, d) > reach * reach) continue;
        this.pairContacts(a, b);
      }
    }

    for (const c of this.contacts) this.prepare(c, h);
    for (let it = 0; it < this.iterations; it++) for (const c of this.contacts) this.solve(c);
    this.recordImpacts();

    for (const b of this.bodies) {
      if (b.asleep) continue;
      // Ground drag stands in for rolling resistance on sand and gravel.
      const linear = b.grounded ? 0.6 : 0.02;
      const angular = b.grounded ? 3.5 : 0.05;
      b.pos = addScaled(b.pos, b.vel, h);
      // Midpoint rule on the rotation; angular momentum is kept exactly.
      const momentum = b.angularMomentum();
      const start = b.rot.slice();
      integrateRotation(b.rot, b.omega, h / 2);
      b.refresh();
      const middle = b.invInertiaWorld(momentum);
      b.rot.set(start);
      integrateRotation(b.rot, middle, h);
      b.refresh();
      b.omega = b.invInertiaWorld(momentum);
      b.vel = scale(b.vel, 1 - linear * h);
      for (let k = 0; k < 6; k++) b.omega[k] *= 1 - angular * h;
      // A pin that lies on its side rolls like a ball: dry resistance brings it to rest.
      const spin = bivNorm(b.omega);
      if (b.grounded && spin > 0 && Math.abs(b.axis()[1]) < 0.35) {
        const f = Math.max(0, 1 - (4 * h) / spin);
        for (let k = 0; k < 6; k++) b.omega[k] *= f;
      }

      if (b.grounded && b.motion() < 0.03) {
        b.quietTime += h;
        if (b.quietTime > 0.4) {
          b.asleep = true;
          b.vel = [0, 0, 0, 0];
          b.omega = biv();
        }
      } else {
        b.quietTime = 0;
      }
    }
  }

  // --- Contact generation ------------------------------------------------------

  private push(a: Body, b: Body | null, point: Vec4, normal: Vec4, depth: number): void {
    if (depth > this.maxPenetration) this.maxPenetration = depth;
    this.contacts.push({
      a,
      b,
      point,
      normal,
      depth,
      ra: sub(point, a.pos),
      rb: b ? sub(point, b.pos) : [0, 0, 0, 0],
      tangents: tangentBasis(normal),
      angA: [],
      angB: [],
      mass: [],
      bias: 0,
      lambdaN: 0,
      lambdaT: [0, 0, 0],
      friction: b ? 0.35 : 0.6,
    });
  }

  private groundContacts(body: Body): void {
    const r = body.rot;
    const down: Vec4 = [-r[4], -r[5], -r[6], -r[7]]; // world -Y in the body frame
    // A fast body gets its contacts a step early, so it stops at the surface, not inside.
    const reach = MARGIN + body.motion() * this.h;
    for (const rim of body.shape.rims) {
      const deepest = rimSupport(rim, down);
      const candidates = deepest ? [deepest, ...rim.groundSamples] : rim.groundSamples;
      for (const p of candidates) {
        const y = r[4] * p[0] + r[5] * p[1] + r[6] * p[2] + r[7] * p[3] + body.pos[1];
        if (y > reach) continue;
        if (y < MARGIN) body.grounded = true;
        this.push(body, null, body.toWorld(p), [0, 1, 0, 0], -y);
      }
    }
  }

  private pairContacts(a: Body, b: Body): void {
    const before = this.contacts.length;
    const reach = MARGIN + (a.motion() + b.motion()) * this.h;
    this.sideContact(a, b, reach);
    this.rimContacts(a, b, 1, reach);
    this.rimContacts(b, a, -1, reach);
    if (this.contacts.length === before) return;
    // A moving body wakes a sleeping one that it touches.
    if (a.asleep && b.motion() > 0.06) a.wake();
    if (b.asleep && a.motion() > 0.06) b.wake();
  }

  /** Exact contact between the two lateral surfaces, where the axis segments cross. */
  private sideContact(a: Body, b: Body, reach: number): void {
    const p1 = a.toWorld(a.shape.axisA);
    const q1 = a.toWorld(a.shape.axisB);
    const p2 = b.toWorld(b.shape.axisA);
    const q2 = b.toWorld(b.shape.axisB);
    const d1 = sub(q1, p1);
    const d2 = sub(q2, p2);
    const r = sub(p1, p2);
    const aa = dot(d1, d1);
    const ee = dot(d2, d2);
    const bb = dot(d1, d2);
    const denom = aa * ee - bb * bb;
    if (denom < 1e-9 * aa * ee) return; // parallel axes: the rims handle it
    const c = dot(d1, r);
    const f = dot(d2, r);
    const s = (bb * f - c * ee) / denom;
    const t = (aa * f - bb * c) / denom;
    if (s <= 0.01 || s >= 0.99 || t <= 0.01 || t >= 0.99) return;
    const ca = addScaled(p1, d1, s);
    const cb = addScaled(p2, d2, t);
    const delta = sub(ca, cb);
    const distance = len(delta);
    const depth = a.shape.radius + b.shape.radius - distance;
    if (depth < -reach || distance < 1e-6) return;
    const normal = scale(delta, 1 / distance);
    this.push(a, b, addScaled(cb, normal, b.shape.radius - depth / 2), normal, depth);
  }

  /** Rim points of `owner` inside `other`. `sign` orients the normal toward body a. */
  private rimContacts(owner: Body, other: Body, sign: 1 | -1, reach: number): void {
    const grad: Vec4 = [0, 0, 0, 0];
    const a = sign === 1 ? owner : other;
    const b = sign === 1 ? other : owner;
    const shape = other.shape;
    const emit = (p: Vec4): void => {
      // The gradient points out of `other`, toward `owner`.
      const normal: Vec4 = sign === 1 ? [grad[0], grad[1], grad[2], grad[3]] : scale(grad, -1);
      this.push(a, b, p, normal, -shape.faceDistance);
    };
    const worldSamples = owner.rimSamplesWorld();
    for (let r = 0; r < owner.shape.rims.length; r++) {
      const rim = owner.shape.rims[r];
      const center = owner.toWorld(rim.base);
      const span = rim.radius + shape.boundRadius + reach;
      const off = sub(center, other.pos);
      if (dot(off, off) > span * span) continue;

      // The rim approaches through the surface of `other` that its centre faces. Every
      // contact of this rim uses that surface. A corner that is level with the base of
      // its neighbour is then pushed sideways, not up.
      other.sdfWorld(center, grad);
      const face = shape.face;

      // The deepest rim point along that surface's inward direction, refined once.
      let best: Vec4 | null = null;
      let bestD = reach;
      for (let pass = 0; pass < 2; pass++) {
        const local = rimSupport(rim, mulTV(owner.rot, scale(grad, -1)));
        if (!local) break;
        const p = owner.toWorld(local);
        if (other.sdfWorld(p, grad, face) >= reach) continue;
        if (shape.faceDistance < bestD) {
          bestD = shape.faceDistance;
          best = p;
        }
      }
      if (best) {
        other.sdfWorld(best, grad, face);
        emit(best);
      }

      // Fixed samples catch flat and crossing contacts. Keep the three deepest.
      const hits: { p: Vec4; d: number }[] = [];
      for (const p of worldSamples[r]) {
        if (other.sdfWorld(p, grad, face) >= 0) continue;
        hits.push({ p, d: shape.faceDistance });
      }
      hits.sort((x, y) => x.d - y.d);
      for (const hit of hits.slice(0, 3)) {
        other.sdfWorld(hit.p, grad, face);
        emit(hit.p);
      }
    }
  }

  // --- Solver ------------------------------------------------------------------

  private prepare(c: Contact, h: number): void {
    const { a, b, normal: n } = c;
    const dynA = !a.asleep;
    const dynB = b !== null && !b.asleep;
    const directions = [n, ...c.tangents];
    for (const d of directions) {
      let k = 0;
      let angA = biv();
      let angB = biv();
      if (dynA) {
        angA = a.invInertiaWorld(wedge(d, c.ra));
        k += a.shape.invMass + dot(d, bivApply(angA, c.ra));
      }
      if (dynB && b) {
        angB = b.invInertiaWorld(wedge(d, c.rb));
        k += b.shape.invMass + dot(d, bivApply(angB, c.rb));
      }
      c.angA.push(angA);
      c.angB.push(angB);
      c.mass.push(k > 0 ? 1 / k : 0);
    }
    const vn = dot(this.relativeVelocity(c), n);
    const restitution = b ? 0.42 : 0.22;
    let bias = 0;
    if (c.depth > SLOP) bias = Math.min((0.2 * (c.depth - SLOP)) / h, 1.5);
    else if (c.depth < 0) bias = c.depth / h; // speculative: may close the gap, no more
    if (vn < -0.6) bias = Math.max(bias, -restitution * vn);
    c.bias = bias;
  }

  private relativeVelocity(c: Contact): Vec4 {
    const va = c.a.asleep ? ([0, 0, 0, 0] as Vec4) : c.a.velocityAt(c.ra);
    if (!c.b || c.b.asleep) return va;
    return sub(va, c.b.velocityAt(c.rb));
  }

  private applyImpulse(c: Contact, index: number, direction: Vec4, lambda: number): void {
    const { a, b } = c;
    if (!a.asleep) {
      a.vel = addScaled(a.vel, direction, lambda * a.shape.invMass);
      const ang = c.angA[index];
      for (let k = 0; k < 6; k++) a.omega[k] += ang[k] * lambda;
    }
    if (b && !b.asleep) {
      b.vel = addScaled(b.vel, direction, -lambda * b.shape.invMass);
      const ang = c.angB[index];
      for (let k = 0; k < 6; k++) b.omega[k] -= ang[k] * lambda;
    }
  }

  private solve(c: Contact): void {
    const vn = dot(this.relativeVelocity(c), c.normal);
    const next = Math.max(c.lambdaN + (c.bias - vn) * c.mass[0], 0);
    const deltaN = next - c.lambdaN;
    c.lambdaN = next;
    if (deltaN !== 0) this.applyImpulse(c, 0, c.normal, deltaN);

    // Friction: a 3D impulse in the tangent space, kept inside the Coulomb cone.
    const maxFriction = c.friction * c.lambdaN;
    for (let i = 0; i < 3; i++) {
      const vt = dot(this.relativeVelocity(c), c.tangents[i]);
      const previous: [number, number, number] = [c.lambdaT[0], c.lambdaT[1], c.lambdaT[2]];
      c.lambdaT[i] -= vt * c.mass[i + 1];
      const total = Math.hypot(c.lambdaT[0], c.lambdaT[1], c.lambdaT[2]);
      if (total > maxFriction) {
        const f = total > 0 ? maxFriction / total : 0;
        c.lambdaT[0] *= f;
        c.lambdaT[1] *= f;
        c.lambdaT[2] *= f;
      }
      for (let j = 0; j < 3; j++) {
        const delta = c.lambdaT[j] - previous[j];
        if (delta !== 0) this.applyImpulse(c, j + 1, c.tangents[j], delta);
      }
    }
  }

  private recordImpacts(): void {
    for (const c of this.contacts) {
      if (c.lambdaN < 0.02) continue;
      const idA = c.a.id;
      const idB = c.b ? c.b.id : -1;
      const known = this.impacts.find((i) => i.bodyA === idA && i.bodyB === idB);
      if (known) {
        if (c.lambdaN > known.strength) {
          known.strength = c.lambdaN;
          known.point = c.point;
        }
      } else {
        this.impacts.push({
          point: c.point,
          strength: c.lambdaN,
          ground: c.b === null,
          bodyA: idA,
          bodyB: idB,
        });
      }
    }
  }
}

/** The rim point farthest along body-frame direction `d`, or null when all are equal. */
function rimSupport(rim: Rim, d: Vec4): Vec4 | null {
  const g0 = dot(rim.a[0], d);
  const g1 = dot(rim.a[1], d);
  const g2 = dot(rim.a[2], d);
  const l = Math.hypot(g0, g1, g2);
  if (l < 1e-7 * rim.radius) return null;
  const b = rim.base;
  const [a0, a1, a2] = rim.a;
  const u0 = g0 / l;
  const u1 = g1 / l;
  const u2 = g2 / l;
  return [
    b[0] + u0 * a0[0] + u1 * a1[0] + u2 * a2[0],
    b[1] + u0 * a0[1] + u1 * a1[1] + u2 * a2[1],
    b[2] + u0 * a0[2] + u1 * a1[2] + u2 * a2[2],
    b[3] + u0 * a0[3] + u1 * a1[3] + u2 * a2[3],
  ];
}

/** Three unit vectors that complete `n` to an orthonormal basis. */
function tangentBasis(n: Vec4): [Vec4, Vec4, Vec4] {
  // Drop the coordinate axis closest to n, then Gram-Schmidt the other three.
  let skip = 0;
  for (let i = 1; i < 4; i++) if (Math.abs(n[i]) > Math.abs(n[skip])) skip = i;
  const basis: Vec4[] = [n];
  for (let i = 0; i < 4; i++) {
    if (i === skip) continue;
    let v: Vec4 = [0, 0, 0, 0];
    v[i] = 1;
    for (const u of basis) v = addScaled(v, u, -dot(v, u));
    basis.push(scale(v, 1 / len(v)));
  }
  return [basis[1], basis[2], basis[3]];
}
