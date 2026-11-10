// Small puffs of sand where wood hits the ground.

import * as THREE from "three";

const POOL = 28;

interface Puff {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
  age: number;
  life: number;
  size: number;
}

export class Dust {
  readonly group = new THREE.Group();
  private readonly puffs: Puff[] = [];
  private next = 0;

  constructor() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const g = canvas.getContext("2d")!;
    const gradient = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    gradient.addColorStop(0, "rgba(255, 240, 214, 0.9)");
    gradient.addColorStop(1, "rgba(255, 240, 214, 0)");
    g.fillStyle = gradient;
    g.fillRect(0, 0, 64, 64);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    for (let i = 0; i < POOL; i++) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0 }),
      );
      sprite.visible = false;
      this.group.add(sprite);
      this.puffs.push({ sprite, velocity: new THREE.Vector3(), age: 0, life: 1, size: 0.1 });
    }
  }

  /** Throw up a few puffs at a point on the ground. `strength` is 0 to 1. */
  burst(x: number, z: number, strength: number): void {
    const count = strength > 0.5 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const puff = this.puffs[this.next];
      this.next = (this.next + 1) % POOL;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + 0.35 * strength * Math.random();
      puff.velocity.set(Math.cos(angle) * speed, 0.18 + 0.3 * strength, Math.sin(angle) * speed);
      puff.sprite.position.set(x, 0.02, z);
      puff.age = 0;
      puff.life = 0.45 + 0.35 * Math.random();
      puff.size = 0.07 + 0.12 * strength;
      puff.sprite.visible = true;
    }
  }

  update(dt: number): void {
    for (const puff of this.puffs) {
      if (!puff.sprite.visible) continue;
      puff.age += dt;
      const t = puff.age / puff.life;
      if (t >= 1) {
        puff.sprite.visible = false;
        continue;
      }
      puff.velocity.multiplyScalar(1 - 2.5 * dt);
      puff.sprite.position.addScaledVector(puff.velocity, dt);
      const size = puff.size * (0.6 + 1.6 * t);
      puff.sprite.scale.set(size, size, 1);
      puff.sprite.material.opacity = 0.34 * (1 - t) * Math.min(1, t * 8);
    }
  }
}
