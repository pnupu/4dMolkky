// The lakeside at first light: sky, sun, lake, islet, grass, far shore and mist.
//
// Far scenery is the same in every slice. Near scenery (ground cover, grass) is a
// function of the three ground directions (x, z, w), so it changes when the slice turns:
// a point at sideways distance s in the slice lies at x = s cos(a), w = s sin(a).

import * as THREE from "three";
import { LINE_Z } from "../game/field";
import { makeNoiseTexture, NOISE_PERIOD } from "./noise";
import { NOISE_GLSL } from "./pins";
import { makeSky } from "./sky";

const SUN_AZIMUTH = (-8 * Math.PI) / 180;
const toward = (elevationDegrees: number): THREE.Vector3 => {
  const e = (elevationDegrees * Math.PI) / 180;
  return new THREE.Vector3(
    Math.sin(SUN_AZIMUTH) * Math.cos(e),
    Math.sin(e),
    -Math.cos(SUN_AZIMUTH) * Math.cos(e),
  ).normalize();
};
/**
 * Unit vector from the field toward the sun in the sky: just over the far shore, ahead
 * and to the left. It is fixed in the view, so the light stays the same while the slice
 * turns.
 */
export const SUN_DIRECTION = toward(3.0);
/** The light comes from a little higher than the painted sun, to keep shadows readable. */
const LIGHT_DIRECTION = toward(8.5);

const WATER_LEVEL = -0.16;
const ISLET_RADIUS = 19;

/**
 * Shared by the ground and the grass: noise by ground position, and where the sandy
 * pitch is. `LOOKUP` is the texture call: the vertex shader must name a mip level.
 */
const groundGlsl = (lookup: (coord: string) => string): string => /* glsl */ `
uniform vec2 uSlice; // cos, sin of the slice angle
uniform highp sampler3D uNoise;
vec3 srgb(vec3 c) {
  return pow(c, vec3(2.2));
}
vec3 groundCoord(vec3 wp) {
  return vec3(wp.x * uSlice.x, wp.z, wp.x * uSlice.y);
}
// Fractal noise, one cell per unit. xyz: two independent fields and a fine one.
vec3 noise3(vec3 p) {
  return ${lookup(`p * ${(1 / NOISE_PERIOD).toFixed(4)}`)}.rgb;
}
// 1 on the trodden sand around the rack and along the throwing lane, 0 in the meadow.
float pitchMask(vec3 wp) {
  vec3 g = groundCoord(wp);
  float along = clamp(wp.z, -0.5, ${(LINE_Z + 0.6).toFixed(3)});
  float d = length(vec2(wp.x, wp.z - along));
  float wobble = noise3(g * 0.9 + 3.7).r + noise3(g * 3.1).g * 0.3;
  return 1.0 - smoothstep(1.5, 2.1, d + wobble - 0.5);
}
`;
const GROUND_FRAGMENT_GLSL = groundGlsl((coord) => `texture(uNoise, ${coord})`);
const GROUND_VERTEX_GLSL = groundGlsl((coord) => `textureLod(uNoise, ${coord}, 0.0)`);

export class Environment {
  readonly group = new THREE.Group();
  readonly sun: THREE.DirectionalLight;
  private readonly sliceUniform = { value: new THREE.Vector2(1, 0) };
  private readonly timeUniform = { value: 0 };
  private readonly noiseUniform = { value: makeNoiseTexture() };

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    // --- Sky and image-based light -------------------------------------------
    this.group.add(makeSky(SUN_DIRECTION));
    const pmrem = new THREE.PMREMGenerator(renderer);
    const skyScene = new THREE.Scene();
    skyScene.add(makeSky(SUN_DIRECTION));
    scene.environment = pmrem.fromScene(skyScene, 0.03).texture;
    scene.environmentIntensity = 0.45;
    const cubeTarget = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
    new THREE.CubeCamera(1, 5000, cubeTarget).update(renderer, skyScene);
    pmrem.dispose();

    // --- Lights ---------------------------------------------------------------
    this.sun = new THREE.DirectionalLight(new THREE.Color(1.0, 0.76, 0.52), 7.5);
    this.sun.position
      .copy(LIGHT_DIRECTION)
      .multiplyScalar(30)
      .add(new THREE.Vector3(0, 0, 0.6));
    this.sun.target.position.set(0, 0, 0.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    const shadowCamera = this.sun.shadow.camera;
    shadowCamera.left = -3.4;
    shadowCamera.right = 3.4;
    shadowCamera.top = 3.6;
    shadowCamera.bottom = -3.6;
    shadowCamera.near = 1;
    shadowCamera.far = 70;
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.004;
    this.group.add(this.sun, this.sun.target);
    this.group.add(
      new THREE.HemisphereLight(
        new THREE.Color(0.86, 0.8, 0.86),
        new THREE.Color(0.62, 0.46, 0.3),
        0.85,
      ),
    );
    // A soft fill from the player's side keeps the near faces of the pins readable.
    const fill = new THREE.DirectionalLight(new THREE.Color(1.0, 0.86, 0.74), 1.3);
    fill.position.set(-3, 2.5, 8);
    this.group.add(fill);

    this.group.add(this.makeGround());
    this.group.add(this.makeGrass());
    this.group.add(this.makeWater(cubeTarget.texture));
    this.group.add(this.makeShore());
    this.group.add(this.makeMist());
    this.group.add(this.makeThrowLine());
  }

  /** Call every frame with the slice angle and the clock. */
  update(slice: number, time: number): void {
    this.sliceUniform.value.set(Math.cos(slice), Math.sin(slice));
    this.timeUniform.value = time;
  }

  private makeGround(): THREE.Mesh {
    const geometry = new THREE.RingGeometry(0.001, ISLET_RADIUS + 6, 160, 40);
    geometry.rotateX(-Math.PI / 2);
    const position = geometry.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      const r = Math.hypot(position.getX(i), position.getZ(i));
      // Flat meadow, then a gentle bank down into the lake.
      const bank = THREE.MathUtils.smoothstep(r, ISLET_RADIUS - 3.5, ISLET_RADIUS + 4);
      position.setY(i, -bank * 0.9);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ roughness: 0.96, metalness: 0 });
    const uniforms = { uSlice: this.sliceUniform, uNoise: this.noiseUniform };
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorld;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvWorld = (modelMatrix * vec4(position, 1.0)).xyz;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
varying vec3 vWorld;
${GROUND_FRAGMENT_GLSL}
float sandHeight(vec3 wp) {
  vec3 g = groundCoord(wp);
  return noise3(g * 3.2).r * 0.5 + noise3(g * 22.0).b * 0.035;
}`,
        )
        .replace(
          "#include <color_fragment>",
          /* glsl */ `#include <color_fragment>
float pitch = pitchMask(vWorld);
{
  vec3 g = groundCoord(vWorld);
  vec3 broad = noise3(g * 0.55 + 11.0);
  vec3 fine = noise3(g * 9.0);
  vec3 grass = mix(srgb(vec3(0.09, 0.17, 0.06)), srgb(vec3(0.15, 0.24, 0.08)), broad.r);
  grass *= 0.7 + 0.5 * fine.r;
  float grit = noise3(g * 38.0).b;
  float pebble = smoothstep(0.80, 0.93, noise3(g * 24.0 + 5.0).b);
  vec3 sand = mix(srgb(vec3(0.66, 0.54, 0.38)), srgb(vec3(0.78, 0.67, 0.49)), noise3(g * 4.0 + 2.0).g);
  sand *= 0.88 + 0.24 * grit;
  sand = mix(sand, srgb(vec3(0.50, 0.46, 0.41)), pebble * 0.6);
  vec3 ground = mix(grass, sand, pitch);
  // Wet, dark sand where the bank meets the water.
  float wet = smoothstep(-0.05, -0.30, vWorld.y);
  ground = mix(ground, srgb(vec3(0.24, 0.20, 0.16)), wet * 0.85);
  diffuseColor.rgb = ground;
}`,
        )
        .replace(
          "#include <normal_fragment_maps>",
          /* glsl */ `#include <normal_fragment_maps>
if (pitch > 0.01) {
  // Small dunes and grit on the sand, from the slope of a height function.
  float e = 0.012;
  float h0 = sandHeight(vWorld);
  float hx = sandHeight(vWorld + vec3(e, 0.0, 0.0));
  float hz = sandHeight(vWorld + vec3(0.0, 0.0, e));
  vec3 bump = normalize(vec3((h0 - hx) / e * 0.012, 1.0, (h0 - hz) / e * 0.012));
  normal = normalize(mix(normal, normalize((viewMatrix * vec4(bump, 0.0)).xyz), pitch));
}`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.97, 0.45, smoothstep(-0.05, -0.30, vWorld.y));",
        );
    };
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
  }

  private makeGrass(): THREE.Mesh {
    const tufts = 120_000;
    // One tuft: three tapered blades. x is across the blade, y runs from root (0) to tip (1).
    const profile = [-0.5, 0, 0.5, 0, -0.36, 0.45, 0.36, 0.45, 0, 1];
    const order = [0, 1, 2, 1, 3, 2, 2, 3, 4];
    const positions: number[] = [];
    const blades: number[] = [];
    const indices: number[] = [];
    for (let b = 0; b < 2; b++) {
      const start = positions.length / 3;
      for (let i = 0; i < profile.length; i += 2) {
        positions.push(profile[i], profile[i + 1], 0);
        blades.push(b * 2.6 + 0.4, 0.5 + b * 0.5, 1 - b * 0.3);
      }
      for (const i of order) indices.push(start + i);
    }
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aBlade", new THREE.Float32BufferAttribute(blades, 3));
    const offsets = new Float32Array(tufts * 3);
    let seed = 12345;
    const random = (): number => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < tufts; i++) {
      // Denser near the middle, where the camera looks.
      const r = (ISLET_RADIUS - 2.4) * random() ** 0.72;
      const a = random() * Math.PI * 2;
      offsets[i * 3] = Math.cos(a) * r;
      offsets[i * 3 + 1] = Math.sin(a) * r + 0.8;
      offsets[i * 3 + 2] = random();
    }
    geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    geometry.instanceCount = tufts;
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uSlice: this.sliceUniform,
        uNoise: this.noiseUniform,
        uTime: this.timeUniform,
        uSun: { value: SUN_DIRECTION },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aOffset;
        attribute vec3 aBlade;
        uniform float uTime;
        uniform vec3 uSun;
        varying float vHeight;
        varying float vTone;
        varying float vBack;
        ${GROUND_VERTEX_GLSL}
        void main() {
          vec3 root = vec3(aOffset.x, 0.0, aOffset.y);
          vec3 g = groundCoord(root);
          float meadow = 1.0 - pitchMask(root);
          vec3 broad = noise3(g * 0.55 + 11.0);
          float tall = 0.03 + 0.11 * broad.g * (0.6 + 0.8 * aOffset.z);
          float h = tall * aBlade.z * smoothstep(0.08, 0.7, meadow);
          float angle = aOffset.z * 6.2832 + aBlade.x;
          vec3 across = vec3(cos(angle), 0.0, sin(angle));
          vec3 lean = vec3(-across.z, 0.0, across.x);
          float gust = sin(uTime * 1.3 + root.x * 0.9 + root.z * 0.7) * 0.5
                     + sin(uTime * 2.1 + root.x * 2.3 - root.z * 1.1 + aOffset.z * 6.0) * 0.3;
          float bend = position.y * position.y * h;
          vec3 p = root + across * (position.x * 0.014 + 0.012 * aBlade.y)
                 + lean * bend * (aBlade.y - 0.6) * 0.9
                 + vec3(bend * (0.25 + 0.3 * gust), position.y * h, bend * 0.12 * gust);
          vHeight = position.y;
          vTone = broad.r + (aOffset.z - 0.5) * 0.5;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // Blades between the eye and the low sun glow through.
          vBack = max(dot(normalize(mv.xyz), normalize((viewMatrix * vec4(uSun, 0.0)).xyz)), 0.0);
          gl_Position = projectionMatrix * mv;
          // No grass on the sand: drop the tuft instead of drawing a flat sliver.
          if (h < 0.006) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vHeight;
        varying float vTone;
        varying float vBack;
        vec3 srgb(vec3 c) { return pow(c, vec3(2.2)); }
        void main() {
          // Thin blades can be sampled outside their edges: keep the inputs in range.
          float height = clamp(vHeight, 0.0, 1.0);
          float tone = clamp(vTone, 0.0, 1.0);
          float back = clamp(vBack, 0.0, 1.0);
          vec3 rootColor = mix(srgb(vec3(0.10, 0.18, 0.06)), srgb(vec3(0.15, 0.24, 0.08)), tone);
          vec3 tipColor = mix(srgb(vec3(0.30, 0.46, 0.14)), srgb(vec3(0.47, 0.55, 0.20)), tone);
          vec3 color = mix(rootColor, tipColor, height * height);
          color += srgb(vec3(1.0, 0.78, 0.36)) * pow(back, 9.0) * height * 0.5;
          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    return mesh;
  }

  private makeWater(sky: THREE.CubeTexture): THREE.Mesh {
    const geometry = new THREE.CircleGeometry(2500, 96);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: this.timeUniform,
        uSky: { value: sky },
        uSun: { value: SUN_DIRECTION },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vWorld = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform samplerCube uSky;
        uniform vec3 uSun;
        varying vec3 vWorld;
        ${NOISE_GLSL}
        float wave(vec2 p, float detail) {
          float t = uTime * 0.3;
          // Long, low swells: crests run across the view.
          float h = vnoise(vec3(p.x * 0.25 + t * 0.4, p.y * 0.9 + t, t * 0.3)) * 0.65;
          h += vnoise(vec3(p.x * 0.8 - t * 0.6, p.y * 2.6 - t * 0.7, t * 0.5)) * 0.25 * detail;
          h += vnoise(vec3(p.x * 2.4 + t, p.y * 7.0 + t * 1.3, t * 0.9)) * 0.10 * detail * detail;
          return h;
        }
        void main() {
          vec3 toEye = cameraPosition - vWorld;
          float distance = length(toEye);
          vec3 view = toEye / distance;
          vec2 p = vWorld.xz;
          // Fine ripples fade with distance, or the far lake turns into noise.
          float detail = 1.0 / (1.0 + distance * 0.035);
          float e = 0.05 + distance * 0.004;
          float h0 = wave(p, detail);
          float strength = 0.16 * (0.35 + 0.65 * detail);
          vec3 normal = normalize(vec3((h0 - wave(p + vec2(e, 0.0), detail)) / e * strength, 1.0,
                                       (h0 - wave(p + vec2(0.0, e), detail)) / e * strength));
          vec3 reflected = reflect(-view, normal);
          reflected.y = abs(reflected.y) + 0.002;
          vec3 skyColor = textureCube(uSky, normalize(reflected)).rgb;
          // The dark far shore reflects in the water below the horizon line.
          float shoreline = smoothstep(0.06, 0.012, reflected.y);
          skyColor = mix(skyColor, srgb(vec3(0.12, 0.16, 0.17)), shoreline * 0.85);
          float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(normal, view), 0.0), 5.0);
          vec3 deep = srgb(vec3(0.06, 0.13, 0.16));
          vec3 color = mix(deep, skyColor, fresnel);
          float toSun = max(dot(normalize(reflected), uSun), 0.0);
          color += vec3(1.0, 0.62, 0.30) * (pow(toSun, 1400.0) * 14.0 + pow(toSun, 120.0) * 0.22);
          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = WATER_LEVEL;
    return mesh;
  }

  /** The far shore: hills and a spruce forest, the same in every direction of the slice. */
  private makeShore(): THREE.Mesh {
    const radius = 520;
    const height = 60;
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 160, 1, true);
    geometry.translate(0, height / 2 + WATER_LEVEL - 0.4, 0);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      uniforms: { uSun: { value: SUN_DIRECTION } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vDirection;
        void main() {
          vUv = uv;
          vDirection = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSun;
        varying vec2 vUv;
        varying vec3 vDirection;
        ${NOISE_GLSL}
        // Height of a row of spruces at position x, in tree widths.
        float spruces(float x, float seed) {
          float best = 0.0;
          for (int k = -1; k <= 1; k++) {
            float cell = floor(x) + float(k);
            float r1 = hash31(vec3(cell, seed, 1.0));
            float r2 = hash31(vec3(cell, seed, 2.0));
            float center = cell + 0.5 + (r1 - 0.5) * 0.7;
            float halfWidth = 0.28 + 0.22 * r2;
            float tall = 0.45 + 0.55 * hash31(vec3(cell, seed, 3.0));
            float t = max(0.0, 1.0 - abs(x - center) / halfWidth);
            best = max(best, pow(t, 0.8) * tall);
          }
          return best;
        }
        void main() {
          float a = vUv.x * 6.2832;
          vec3 ring = vec3(cos(a), sin(a), 0.0);
          float y = vUv.y;
          float farHill = 0.20 + 0.34 * fbm(ring * 1.7 + 2.0);
          float nearHill = 0.07 + 0.11 * fbm(ring * 3.1 + 9.0);
          float nearTop = nearHill + 0.085 * spruces(vUv.x * 620.0, 3.0)
                        + 0.05 * spruces(vUv.x * 1100.0 + 0.4, 7.0);
          float midTop = nearHill * 1.5 + 0.06 + 0.05 * spruces(vUv.x * 900.0 + 0.2, 11.0);
          float nearMask = smoothstep(nearTop + 0.003, nearTop - 0.003, y);
          float midMask = smoothstep(midTop + 0.004, midTop - 0.004, y);
          float farMask = smoothstep(farHill + 0.01, farHill - 0.01, y);
          float glow = pow(max(dot(vDirection, normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0), 5.0);
          vec3 haze = mix(srgb(vec3(0.62, 0.62, 0.70)), srgb(vec3(1.0, 0.72, 0.50)), glow);
          vec3 farColor = mix(srgb(vec3(0.33, 0.38, 0.47)), haze, 0.55);
          vec3 midColor = mix(srgb(vec3(0.17, 0.24, 0.27)), haze, 0.34 + 0.18 * glow);
          vec3 nearColor = mix(srgb(vec3(0.08, 0.13, 0.13)), haze, 0.14 + 0.16 * glow);
          vec3 color = mix(farColor, midColor, midMask);
          color = mix(color, nearColor, nearMask);
          // Mist gathers at the foot of the forest.
          color = mix(color, haze, smoothstep(0.10, 0.0, y) * 0.55);
          float alpha = max(max(nearMask, midMask), farMask);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(color, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = -1;
    return mesh;
  }

  /** Low mist over the water, thickest toward the sun. */
  private makeMist(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(170, 170, 8, 96, 1, true);
    geometry.translate(0, 4 + WATER_LEVEL, 0);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: this.timeUniform, uSun: { value: SUN_DIRECTION } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vDirection;
        void main() {
          vUv = uv;
          vDirection = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uSun;
        varying vec2 vUv;
        varying vec3 vDirection;
        ${NOISE_GLSL}
        void main() {
          float a = vUv.x * 6.2832;
          float drift = fbm(vec3(cos(a) * 3.0, sin(a) * 3.0, vUv.y * 2.0 + uTime * 0.02));
          float band = smoothstep(0.0, 0.06, vUv.y) * smoothstep(0.85, 0.1, vUv.y);
          float glow = pow(max(dot(vDirection, normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0), 3.0);
          vec3 color = mix(srgb(vec3(0.72, 0.74, 0.80)), srgb(vec3(1.0, 0.78, 0.56)), glow);
          gl_FragColor = vec4(color, band * (0.2 + 0.5 * drift) * (0.5 + 0.5 * glow));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 0;
    return mesh;
  }

  /** The mölkkaari: a weathered plank that marks the throwing line. */
  private makeThrowLine(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1.1, 0.035, 0.07);
    const material = new THREE.MeshStandardMaterial({ color: "#8a6a45", roughness: 0.85 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.0175, LINE_Z - 0.12);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}
