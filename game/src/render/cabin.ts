// A small red sauna cabin and a dock on the far side of the islet.
//
// The cabin is a 4D object too: it stands at one place in the two sideways ground
// directions and is only a few metres thick in the hidden one. Turn the slice far enough
// and the slice no longer passes through it, so it dissolves out of view. Half a turn
// later it shows on the other side, mirrored.

import * as THREE from "three";

/** Where the cabin stands: x in the sideways direction at slice angle 0, and z. */
const SITE_X = 2.5;
const SITE_Z = -16.2;
/** Thickness in the hidden direction, in metres. */
const DEPTH = 2.4;
const SCALE = 0.82;

const plankTexture = (base: string, line: string, vertical: boolean): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const g = canvas.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 16; i++) {
    const shade = 0.06 + (0.1 * ((i * 7919) % 13)) / 13;
    g.fillStyle = `rgba(0, 0, 0, ${shade})`;
    if (vertical) g.fillRect(i * 16, 0, 16, 256);
    else g.fillRect(0, i * 16, 256, 16);
    g.fillStyle = line;
    if (vertical) g.fillRect(i * 16, 0, 1.5, 256);
    else g.fillRect(0, i * 16, 256, 1.5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

export class Cabin {
  readonly group = new THREE.Group();
  private readonly materials: THREE.MeshStandardMaterial[] = [];

  constructor() {
    const material = (
      options: THREE.MeshStandardMaterialParameters,
    ): THREE.MeshStandardMaterial => {
      // Dithered transparency: the cabin can dissolve without sorting problems.
      const m = new THREE.MeshStandardMaterial({ roughness: 0.9, alphaHash: true, ...options });
      this.materials.push(m);
      return m;
    };
    const red = material({ map: plankTexture("#8a2c22", "rgba(40, 8, 6, 0.55)", true) });
    red.map!.repeat.set(1.6, 1);
    const white = material({ color: "#e9e2d2" });
    const roofing = material({ color: "#26282c", roughness: 0.7 });
    const stone = material({ color: "#5b5852" });
    const dark = material({ color: "#2a1c14" });
    const glass = material({
      color: "#2b1c0c",
      emissive: "#ffb45c",
      emissiveIntensity: 3.2,
      roughness: 0.3,
    });
    const decking = material({ map: plankTexture("#6f5a44", "rgba(25, 18, 12, 0.6)", false) });
    decking.map!.repeat.set(1, 6);

    const add = (
      geometry: THREE.BufferGeometry,
      m: THREE.Material,
      x: number,
      y: number,
      z: number,
    ): THREE.Mesh => {
      const mesh = new THREE.Mesh(geometry, m);
      mesh.position.set(x, y, z);
      this.group.add(mesh);
      return mesh;
    };
    const box = (w: number, h: number, d: number): THREE.BoxGeometry =>
      new THREE.BoxGeometry(w, h, d);

    // Cabin body on a stone footing. Its front (with the door) faces the player.
    const width = 2.7;
    const height = 1.95;
    const depth = 2.3;
    add(box(width + 0.12, 0.22, depth + 0.12), stone, 0, 0.11, 0);
    add(box(width, height, depth), red, 0, 0.22 + height / 2, 0);
    // Gable roof: a triangular prism with an overhang.
    const rise = 0.85;
    const half = width / 2 + 0.28;
    const gable = new THREE.Shape();
    gable.moveTo(-half, 0);
    gable.lineTo(0, rise);
    gable.lineTo(half, 0);
    gable.lineTo(-half, 0);
    const roof = new THREE.ExtrudeGeometry(gable, { depth: depth + 0.5, bevelEnabled: false });
    roof.translate(0, 0, -(depth + 0.5) / 2);
    add(roof, roofing, 0, 0.22 + height, 0);
    // Red gable ends under the roof.
    const end = new THREE.Shape();
    end.moveTo(-width / 2, 0);
    end.lineTo(0, (rise * (width / 2)) / half);
    end.lineTo(width / 2, 0);
    end.lineTo(-width / 2, 0);
    const endGeometry = new THREE.ExtrudeGeometry(end, {
      depth: depth - 0.02,
      bevelEnabled: false,
    });
    endGeometry.translate(0, 0, -(depth - 0.02) / 2);
    add(endGeometry, red, 0, 0.22 + height - 0.001, 0);
    // White corner boards and eaves.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        add(box(0.1, height, 0.1), white, (sx * width) / 2, 0.22 + height / 2, (sz * depth) / 2);
      }
    }
    // Door and a lit window on the front.
    const front = depth / 2 + 0.012;
    add(box(0.74, 1.5, 0.05), white, -0.55, 0.22 + 0.75, front);
    add(box(0.62, 1.4, 0.06), dark, -0.55, 0.22 + 0.72, front + 0.005);
    add(box(0.82, 0.72, 0.05), white, 0.62, 0.22 + 1.18, front);
    add(box(0.68, 0.58, 0.06), glass, 0.62, 0.22 + 1.18, front + 0.005);
    add(box(0.05, 0.58, 0.07), white, 0.62, 0.22 + 1.18, front + 0.006);
    add(box(0.68, 0.05, 0.07), white, 0.62, 0.22 + 1.18, front + 0.006);
    // Chimney.
    add(box(0.32, 0.7, 0.32), stone, 0.55, 0.22 + height + 0.75, -0.3);
    // The window throws a little warm light on the grass.
    const glow = new THREE.PointLight("#ffb060", 6, 7, 2);
    glow.position.set(0.62, 1.3, front + 0.5);
    this.group.add(glow);

    // Dock: from the bank beside the cabin out over the water.
    const dockLength = 8.5;
    const dock = add(box(1.25, 0.07, dockLength), decking, 3.1, 0.02, -1.2 - dockLength / 2);
    dock.rotation.y = -0.32;
    dock.position.set(
      3.1 + Math.sin(0.32) * (dockLength / 2),
      -0.02,
      -1.4 - Math.cos(0.32) * (dockLength / 2),
    );
    for (let i = 0; i < 5; i++) {
      const along = 0.6 + i * 1.9;
      for (const side of [-0.56, 0.56]) {
        const post = add(
          new THREE.CylinderGeometry(0.06, 0.07, 1.3, 8),
          dark,
          3.1 + Math.sin(0.32) * along + Math.cos(0.32) * side,
          -0.45,
          -1.4 - Math.cos(0.32) * along + Math.sin(0.32) * side,
        );
        post.rotation.y = 0;
      }
    }
    this.group.position.set(SITE_X, -0.05, SITE_Z);
    this.group.scale.setScalar(SCALE);
  }

  /** Place and fade the cabin for the slice at angle `slice`. */
  update(slice: number): void {
    const side = SITE_X * Math.cos(slice);
    const hidden = Math.abs(SITE_X * Math.sin(slice));
    const presence = 1 - THREE.MathUtils.smoothstep(hidden, DEPTH * 0.28, DEPTH * 0.5);
    this.group.visible = presence > 0.004;
    if (!this.group.visible) return;
    this.group.position.x = side;
    this.group.scale.x = Math.cos(slice) < 0 ? -SCALE : SCALE;
    for (const m of this.materials) m.opacity = presence;
  }
}
