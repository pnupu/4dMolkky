// The dawn sky: a painted gradient with a low sun, its glow, and thin lit clouds.

import * as THREE from "three";
import { NOISE_GLSL } from "./pins";

export const makeSky = (sun: THREE.Vector3): THREE.Mesh => {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uSun: { value: sun } },
    vertexShader: /* glsl */ `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      varying vec3 vDirection;
      ${NOISE_GLSL}
      void main() {
        vec3 d = normalize(vDirection);
        float h = max(d.y, 0.0);
        float toSun = max(dot(d, uSun), 0.0);
        // How much this side of the sky faces the sunrise.
        float warm = pow(dot(normalize(d.xz + 1e-5), normalize(uSun.xz)) * 0.5 + 0.5, 2.5);

        vec3 zenith = srgb(vec3(0.15, 0.27, 0.52));
        vec3 upper = srgb(vec3(0.38, 0.52, 0.76));
        vec3 horizon = mix(srgb(vec3(0.74, 0.70, 0.80)), srgb(vec3(1.0, 0.71, 0.45)), warm);
        vec3 color = mix(horizon, upper, smoothstep(0.0, 0.26, h));
        color = mix(color, zenith, smoothstep(0.18, 0.85, h));
        // A band of peach just above the horizon on the sunrise side.
        color = mix(color, srgb(vec3(1.0, 0.80, 0.62)), warm * smoothstep(0.16, 0.02, h) * 0.5);

        // Thin, high clouds, lit from below.
        vec2 plane = d.xz / (d.y + 0.16);
        float n = fbm(vec3(plane.x * 0.55 + 3.0, plane.y * 1.9, 0.5));
        float cloud = smoothstep(0.50, 0.78, n) * smoothstep(0.015, 0.14, h) * smoothstep(0.75, 0.3, h);
        vec3 cloudColor = mix(srgb(vec3(0.62, 0.58, 0.70)), srgb(vec3(1.0, 0.70, 0.52)), warm);
        cloudColor += srgb(vec3(1.0, 0.75, 0.5)) * pow(toSun, 6.0) * 0.6;
        color = mix(color, cloudColor, cloud * 0.72);

        // The sun: a wide glow, a tight halo and the disc itself.
        vec3 sunColor = vec3(1.0, 0.74, 0.46);
        color += sunColor * (pow(toSun, 8.0) * 0.16 + pow(toSun, 64.0) * 0.30 + pow(toSun, 700.0) * 0.9);
        color += vec3(1.0, 0.9, 0.75) * smoothstep(0.99975, 0.99992, toSun) * 9.0;

        // Below the horizon, for reflections and ambient light: dim ground haze.
        color = mix(color, horizon * 0.42, smoothstep(0.0, -0.12, d.y));
        gl_FragColor = vec4(color * 1.45, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), material);
  mesh.scale.setScalar(3000);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return mesh;
};
