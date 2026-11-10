// Visuals for pins and the throwing skittle: the wooden slice, the ghost of the part
// that lies outside the slice, a ground ring, and a floating number.

import * as THREE from "three";
import { hiddenAxis, lateralAxis } from "../game/field";
import { dot, type Mat4, mulMM, mulTV, type Vec4 } from "../math4";
import type { Shape } from "../physics/shape";
import type { Body } from "../physics/world";
import { buildTetMesh, SliceGeometry, type TetMesh } from "./slicer";

/** Colour for things on the negative hidden side, and on the positive side. */
export const COLOR_BELOW = new THREE.Color("#4aa8ff");
export const COLOR_ABOVE = new THREE.Color("#ffab3d");

const NOISE_GLSL = /* glsl */ `
float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x),
        mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
        mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
// Colours are written as they look on screen; lighting works in linear light.
vec3 srgb(vec3 c) {
  return pow(c, vec3(2.2));
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}
`;
export { NOISE_GLSL };

/** One texture with the numbers 1 to 12, four per row. */
const makeDigitAtlas = (): THREE.CanvasTexture => {
  const cell = 256;
  const canvas = document.createElement("canvas");
  canvas.width = cell * 4;
  canvas.height = cell * 3;
  const g = canvas.getContext("2d")!;
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let n = 1; n <= 12; n++) {
    const cx = ((n - 1) % 4) * cell + cell / 2;
    const cy = Math.floor((n - 1) / 4) * cell + cell / 2;
    g.font = `800 ${n > 9 ? 118 : 150}px "Avenir Next", "Helvetica Neue", Arial, sans-serif`;
    g.fillText(String(n), cx, cy + 6);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
};

interface WoodUniforms {
  uDigit: { value: number };
  uLateral: { value: THREE.Vector4 };
  uSeed: { value: number };
  uRadius: { value: number };
  uAtlas: { value: THREE.Texture };
}

/** Pale birch with growth rings, and a burnt-in number on the slanted top. */
const makeWoodMaterial = (
  atlas: THREE.Texture,
  digit: number,
  seed: number,
  radius: number,
): { material: THREE.MeshStandardMaterial; uniforms: WoodUniforms } => {
  const uniforms: WoodUniforms = {
    uDigit: { value: digit },
    uLateral: { value: new THREE.Vector4(1, 0, 0, 0) },
    uSeed: { value: seed },
    uRadius: { value: radius },
    uAtlas: { value: atlas },
  };
  const material = new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec4 aLocal;\nattribute float aFace;\nvarying vec4 vLocal;\nvarying float vFace;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLocal = aLocal;\nvFace = aFace;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec4 vLocal;
varying float vFace;
uniform float uDigit;
uniform vec4 uLateral;
uniform float uSeed;
uniform float uRadius;
uniform sampler2D uAtlas;
${NOISE_GLSL}`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
{
  // Ball coordinates across the grain, and the height along it.
  vec3 ball = vLocal.xzw / uRadius;
  float along = vLocal.y / uRadius;
  vec3 seed = vec3(uSeed * 7.3, uSeed * 3.1, uSeed * 5.7);
  // The tree's pith sits off-centre, so the rings run out through the side.
  vec3 pith = vec3(0.35 * sin(uSeed * 12.9), 0.3 * cos(uSeed * 4.1), 0.33 * sin(uSeed * 7.7));
  float warp = fbm(ball * 1.6 + seed + vec3(0.0, along * 0.18, along * 0.11));
  float rings = length(ball - pith) * 7.0 + warp * 2.0 + along * 0.1;
  float ring = smoothstep(0.0, 1.0, abs(fract(rings) * 2.0 - 1.0));
  float fibre = fbm(vec3(ball.x * 22.0, ball.y * 22.0 + ball.z * 22.0, along * 1.1) + seed);
  vec3 light = srgb(vec3(0.94, 0.80, 0.58));
  vec3 dark = srgb(vec3(0.80, 0.62, 0.40));
  vec3 wood = mix(dark, light, 0.35 + 0.65 * ring);
  wood *= 0.96 + 0.08 * fibre;
  // End grain on the base and top shows the rings more strongly.
  if (vFace > 0.5) wood = mix(dark * 0.95, light, 0.25 + 0.75 * ring) * (0.96 + 0.08 * fibre);
  if (vFace > 1.5 && uDigit >= 0.0) {
    vec3 across = vec3(uLateral.x, 0.0, uLateral.w);
    across = length(across) > 1e-4 ? normalize(across) : vec3(1.0, 0.0, 0.0);
    vec2 uv = vec2(dot(ball, across), -ball.y) * 0.5 + 0.5;
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
      float col = mod(uDigit, 4.0);
      float row = floor(uDigit / 4.0);
      vec2 cell = (vec2(col, 2.0 - row) + uv) / vec2(4.0, 3.0);
      float ink = texture2D(uAtlas, cell).a;
      wood = mix(wood, srgb(vec3(0.16, 0.10, 0.07)), smoothstep(0.35, 0.65, ink) * 0.95);
    }
  }
  diffuseColor.rgb = wood;
}`,
      );
  };
  return { material, uniforms };
};

const makeGhostMaterial = (): THREE.ShaderMaterial =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
        gl_FragColor = vec4(uColor * (0.8 + 1.0 * rim), uOpacity * (0.13 + 0.87 * rim));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

const tetCache = new Map<Shape, TetMesh>();
const tetMeshFor = (shape: Shape): TetMesh => {
  let mesh = tetCache.get(shape);
  if (!mesh) {
    mesh = buildTetMesh(shape, 2);
    tetCache.set(shape, mesh);
  }
  return mesh;
};

let atlas: THREE.CanvasTexture | undefined;
/** The slice as a body-to-slice transform: rows are sideways, up, Z and hidden. */
export const sliceMatrix = (slice: number): Mat4 => {
  const side = lateralAxis(slice);
  const hidden = hiddenAxis(slice);
  return new Float64Array([...side, 0, 1, 0, 0, 0, 0, 1, 0, ...hidden]);
};

export class PinVisual {
  readonly group = new THREE.Group();
  /** Signed distance of the body's centre from the slice, after the last update. */
  hidden = 0;
  /** Centre of the body in slice space. */
  readonly center = new THREE.Vector3();
  private readonly solid: SliceGeometry;
  private readonly ghost: SliceGeometry;
  private readonly solidMesh: THREE.Mesh;
  private readonly ghostMesh: THREE.Mesh;
  private readonly ghostMaterial: THREE.ShaderMaterial;
  private readonly ring: THREE.Mesh;
  private readonly uniforms: WoodUniforms;
  /** Where the floating number points: just above the top of the body. */
  readonly labelAnchor = new THREE.Vector3();
  /** 0 when the slice cuts the body through its centre, 1 when only its ghost shows. */
  ghostStrength = 0;
  /** How visible the ghost is, 0 to 1. */
  ghostOpacity = 0;

  constructor(
    readonly body: Body,
    readonly number: number | null,
  ) {
    atlas ??= makeDigitAtlas();
    const tet = tetMeshFor(body.shape);
    this.solid = new SliceGeometry(tet);
    this.ghost = new SliceGeometry(tet);
    const wood = makeWoodMaterial(
      atlas,
      number === null ? -1 : number - 1,
      number === null ? 0.37 : number * 0.731,
      body.shape.radius,
    );
    this.uniforms = wood.uniforms;
    this.solidMesh = new THREE.Mesh(this.solid.geometry, wood.material);
    this.solidMesh.castShadow = true;
    this.solidMesh.receiveShadow = true;
    this.solidMesh.frustumCulled = false;
    this.ghostMaterial = makeGhostMaterial();
    this.ghostMesh = new THREE.Mesh(this.ghost.geometry, this.ghostMaterial);
    this.ghostMesh.frustumCulled = false;
    this.ghostMesh.renderOrder = 2;
    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(body.shape.radius * 0.82, body.shape.radius * 1.12, 40),
      new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }),
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.renderOrder = 1;
    this.group.add(this.solidMesh, this.ghostMesh, this.ring);
  }

  /** Re-cut the body for the slice at angle `slice`. */
  update(slice: number): void {
    const body = this.body;
    const s = sliceMatrix(slice);
    const m = mulMM(s, body.rot);
    const p = body.pos;
    const t = [
      s[0] * p[0] + s[1] * p[1] + s[2] * p[2] + s[3] * p[3],
      p[1],
      p[2],
      s[12] * p[0] + s[13] * p[1] + s[14] * p[2] + s[15] * p[3],
    ];
    this.hidden = t[3];
    this.center.set(t[0], t[1], t[2]);
    const reach = body.shape.boundRadius;
    const radius = body.shape.radius;

    const inSlice = Math.abs(t[3]) < reach;
    this.solidMesh.visible = inSlice;
    if (inSlice) {
      this.solid.update(m, t, 0);
      this.solidMesh.visible = this.solid.triangles > 0;
      // The reading direction of the number: the slice's sideways axis in the shape frame.
      const lateral: Vec4 = mulTV(body.rot, lateralAxis(slice));
      const inShape = [0, 0, 0, 0];
      const P = body.shape.P;
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) inShape[i] += P[4 * i + j] * lateral[j];
      this.uniforms.uLateral.value.set(inShape[0], inShape[1], inShape[2], inShape[3]);
    }

    // The ghost is the cut through the body's own centre, shown when the slice misses it.
    const away = Math.abs(t[3]);
    const ghostStrength = THREE.MathUtils.smoothstep(away, radius * 0.12, radius * 0.6);
    const fade = 1 / (1 + (away / 0.35) ** 2);
    const opacity = ghostStrength * (0.2 + 0.8 * fade);
    const tint = t[3] > 0 ? COLOR_ABOVE : COLOR_BELOW;
    this.ghostMesh.visible = opacity > 0.01;
    if (this.ghostMesh.visible) {
      this.ghost.update(m, t, t[3]);
      (this.ghostMaterial.uniforms.uColor.value as THREE.Color).copy(tint);
      this.ghostMaterial.uniforms.uOpacity.value = opacity;
    }
    const base = body.toWorld(body.shape.baseCenter);
    const baseSide = dot(base, lateralAxis(slice));
    this.ring.visible = this.ghostMesh.visible && base[1] < 0.05;
    if (this.ring.visible) {
      this.ring.position.set(baseSide, 0.004, base[2]);
      const material = this.ring.material as THREE.MeshBasicMaterial;
      material.color.copy(tint);
      material.opacity = opacity * 0.85;
    }
    this.ghostStrength = ghostStrength;
    this.ghostOpacity = opacity;
    const top = t[1] + Math.abs(body.axis()[1]) * body.shape.height * 0.42 + radius * 0.4;
    this.labelAnchor.set(t[0], Math.max(top, radius * 2), t[2]);
  }

  dispose(): void {
    this.solid.geometry.dispose();
    this.ghost.geometry.dispose();
    this.ring.geometry.dispose();
    (this.solidMesh.material as THREE.Material).dispose();
    this.ghostMaterial.dispose();
    (this.ring.material as THREE.Material).dispose();
  }
}
