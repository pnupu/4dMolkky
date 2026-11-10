// A tiling 3D noise texture. Ground and grass look their patterns up in it by ground
// position (x, z, w), which is far cheaper than computing noise in the shader.

import * as THREE from "three";

const hash = (x: number, y: number, z: number, seed: number): number => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ seed;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

/** Smooth value noise that repeats every `period` cells. */
const valueNoise = (x: number, y: number, z: number, period: number, seed: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const fade = (t: number): number => t * t * (3 - 2 * t);
  const fx = fade(x - xi);
  const fy = fade(y - yi);
  const fz = fade(z - zi);
  const at = (dx: number, dy: number, dz: number): number =>
    hash((xi + dx) % period, (yi + dy) % period, (zi + dz) % period, seed);
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
  return lerp(
    lerp(lerp(at(0, 0, 0), at(1, 0, 0), fx), lerp(at(0, 1, 0), at(1, 1, 0), fx), fy),
    lerp(lerp(at(0, 0, 1), at(1, 0, 1), fx), lerp(at(0, 1, 1), at(1, 1, 1), fx), fy),
    fz,
  );
};

/** Base cells across the texture: one cell per unit when sampled at `p / NOISE_PERIOD`. */
export const NOISE_PERIOD = 8;

/**
 * R: four-octave fractal noise. G: a second, independent fractal noise.
 * B: one fine octave, for grit. All in 0..1.
 */
export const makeNoiseTexture = (size = 64): THREE.Data3DTexture => {
  const data = new Uint8Array(size * size * size * 4);
  const fractal = (u: number, v: number, w: number, seed: number): number => {
    let sum = 0;
    let amplitude = 0.5;
    let cells = NOISE_PERIOD;
    for (let octave = 0; octave < 4; octave++) {
      sum += amplitude * valueNoise(u * cells, v * cells, w * cells, cells, seed + octave);
      amplitude *= 0.5;
      cells *= 2;
    }
    return sum / 0.9375;
  };
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        const w = z / size;
        data[i++] = Math.round(fractal(u, v, w, 11) * 255);
        data[i++] = Math.round(fractal(u, v, w, 97) * 255);
        data[i++] = Math.round(valueNoise(u * 32, v * 32, w * 32, 32, 5) * 255);
        data[i++] = 255;
      }
    }
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};
