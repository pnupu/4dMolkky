// Record a gameplay clip frame by frame. The game clock is stepped by hand, so the
// frames are evenly spaced whatever the capture speed. Encode the frames with ffmpeg:
//
//   bun scripts/film.ts <url> <frames-dir>
//   ffmpeg -framerate 30 -i <frames-dir>/f%05d.jpg -c:v libx264 -pix_fmt yuv420p out.mp4
//
// The clip has no sound: headless capture does not record audio.

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const [url = "http://127.0.0.1:5183/", out = "frames"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist", "--mute-audio"],
  defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1.5 },
});
const page = await browser.newPage();
await page.goto(url, { waitUntil: "load" });
await new Promise((resolve) => setTimeout(resolve, 2500));

let frame = 0;
/** Advance the game and save frames for `seconds` of game time. */
const roll = async (seconds: number, each?: (t: number) => Promise<void>): Promise<void> => {
  const count = Math.round(seconds * FPS);
  for (let i = 0; i < count; i++) {
    if (each) await each(i / count);
    await page.evaluate((dt) => window.molkky?.advance(dt), 1 / FPS);
    const name = `f${String(frame++).padStart(5, "0")}.jpg` as const;
    await page.screenshot({ path: join(out, name) as `${string}.jpg`, type: "jpeg", quality: 93 });
  }
};
const phase = () => page.evaluate(() => window.molkky?.state().phase);
/** Roll until the game waits for the next throw, or the match is over. */
const untilAim = async (): Promise<void> => {
  for (let i = 0; i < 20 * FPS; i++) {
    const p = await phase();
    if (p === "aim" || p === "over") return;
    await roll(1 / FPS);
  }
};
const turn = (from: number, to: number) => async (t: number) => {
  const eased = t * t * (3 - 2 * t);
  await page.evaluate((a) => window.molkky?.setSlice(a), from + (to - from) * eased);
};
const throwWith = async (x: number, y: number, hold: number): Promise<void> => {
  await page.mouse.move(x, y);
  await roll(0.5);
  await page.mouse.down();
  await roll(hold);
  await page.mouse.up();
  await untilAim();
};

// The menu, then a match.
await roll(2.5);
await page.evaluate(() => window.molkky?.start(["You"]));
await roll(2.2);
// Turn the view through the fourth dimension and back.
await roll(3.2, turn(0, Math.PI / 2));
await roll(1.0);
await roll(2.6, turn(Math.PI / 2, 0));
await roll(0.6);
// Three throws: straight at the rack, then two after turning the slice.
await throwWith(WIDTH / 2 + 4, HEIGHT * 0.66, 0.66);
await roll(0.8);
await roll(1.8, turn(0, 0.55));
await throwWith(WIDTH / 2 - 30, HEIGHT * 0.66, 0.62);
await roll(0.8);
await roll(1.8, turn(0.55, -0.4));
await throwWith(WIDTH / 2 + 40, HEIGHT * 0.67, 0.64);
await roll(1.5);

const state = await page.evaluate(() => window.molkky?.state());
console.log(`frames ${frame}, score ${state?.scores}, throws ${state?.throws}`);
await browser.close();
