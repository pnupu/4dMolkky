// The aim guide: a dotted arc of the predicted flight and a ring where the skittle lands.

import * as THREE from "three";
import { PIN_RADIUS } from "../game/equipment";
import { LINE_Z, RELEASE_HEIGHT, type ThrowInput } from "../game/field";

const DOTS = 28;
const GRAVITY = 9.81;

/** Flight time and landing point (sideways, z) in slice space, without air drag. */
export const predictLanding = (input: ThrowInput): { time: number; side: number; z: number } => {
  const up = Math.sin(input.loft) * input.speed;
  const flat = Math.cos(input.loft) * input.speed;
  const drop = RELEASE_HEIGHT - PIN_RADIUS;
  const time = (up + Math.sqrt(up * up + 2 * GRAVITY * drop)) / GRAVITY;
  return {
    time,
    side: Math.sin(input.yaw) * flat * time,
    z: LINE_Z - Math.cos(input.yaw) * flat * time,
  };
};

const dotTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(16, 16, 13, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(canvas);
};

export class AimGuide {
  readonly group = new THREE.Group();
  private readonly dots: THREE.Points;
  private readonly ring: THREE.Mesh;
  private readonly lane: THREE.Mesh;
  private readonly positions = new Float32Array(DOTS * 3);

  constructor() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    // Dots keep one size on screen, wherever they are along the arc.
    this.dots = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: "#fff6e0",
        size: 7,
        sizeAttenuation: false,
        map: dotTexture(),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    this.dots.frustumCulled = false;
    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(0.085, 0.105, 48),
      new THREE.MeshBasicMaterial({
        color: "#fff6e0",
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    this.ring.rotation.x = -Math.PI / 2;
    // A faint line on the ground along the aim direction.
    this.lane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.012, 1),
      new THREE.MeshBasicMaterial({
        color: "#fff6e0",
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    this.lane.rotation.x = -Math.PI / 2;
    this.group.add(this.dots, this.ring, this.lane);
  }

  /** Show the guide. With `charging` false only the direction line is drawn. */
  update(input: ThrowInput, charging: boolean): void {
    this.group.visible = true;
    const length = 2.6;
    this.lane.scale.set(1, length, 1);
    this.lane.rotation.z = -input.yaw;
    this.lane.position.set(
      (Math.sin(input.yaw) * length) / 2,
      0.006,
      LINE_Z - (Math.cos(input.yaw) * length) / 2,
    );
    this.dots.visible = charging;
    this.ring.visible = charging;
    if (!charging) return;
    const landing = predictLanding(input);
    const up = Math.sin(input.loft) * input.speed;
    const flat = Math.cos(input.loft) * input.speed;
    for (let i = 0; i < DOTS; i++) {
      // The first part of the flight passes under the camera: start the dots after it.
      const t = landing.time * (0.3 + (0.7 * (i + 1)) / (DOTS + 1));
      this.positions[i * 3] = Math.sin(input.yaw) * flat * t;
      this.positions[i * 3 + 1] = RELEASE_HEIGHT + up * t - 0.5 * GRAVITY * t * t;
      this.positions[i * 3 + 2] = LINE_Z - Math.cos(input.yaw) * flat * t;
    }
    this.dots.geometry.getAttribute("position").needsUpdate = true;
    this.ring.position.set(landing.side, 0.008, landing.z);
  }

  hide(): void {
    this.group.visible = false;
  }
}
