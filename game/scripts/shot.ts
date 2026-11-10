// Drive the game in headless Chrome and save screenshots.
//
//   bun scripts/shot.ts <url> <output-dir> [scenario]
//
// Scenarios: menu (default), aim, throw, turn, match.

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const [url = "http://localhost:5183/", out = "shots", scenario = "menu"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist", "--mute-audio"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const problems: string[] = [];
page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warn")
    problems.push(`${message.type()}: ${message.text()}`);
});
page.on("pageerror", (error) => problems.push(`pageerror: ${(error as Error).message}`));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const shot = async (name: string) => {
  await page.screenshot({ path: join(out, `${name}.png`) as `${string}.png` });
  console.log(`saved ${join(out, `${name}.png`)}`);
};
const state = () => page.evaluate(() => window.molkky?.state());
const until = async (
  test: (s: NonNullable<Awaited<ReturnType<typeof state>>>) => boolean,
  ms = 30000,
) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const s = await state();
    if (s && test(s)) return s;
    await wait(100);
  }
  throw new Error("timed out waiting for the game state");
};

await page.goto(url, { waitUntil: "load" });
await wait(2500);

if (scenario === "menu") {
  await shot("menu");
} else {
  await page.evaluate(() => window.molkky?.start(["You"]));
  await wait(1800);
  await page.mouse.move(720, 520);
  await wait(600);
  await shot("aim");
  if (scenario === "close") {
    await page.evaluate(() => window.molkky?.view([0.32, 0.3, 0.72, 0, 0.07, 0, 30]));
    for (const degrees of [0, 25, 90]) {
      await page.evaluate((a) => window.molkky?.setSlice(a), (degrees * Math.PI) / 180);
      await wait(900);
      await shot(`close-${degrees}`);
    }
  }
  if (scenario === "turn") {
    for (const degrees of [20, 45, 90, 135]) {
      await page.evaluate((a) => window.molkky?.setSlice(a), (degrees * Math.PI) / 180);
      await wait(900);
      await shot(`turn-${degrees}`);
    }
  }
  if (scenario === "hit") {
    // A filmstrip of one throw that hits the rack.
    const input = JSON.parse(process.argv[5] ?? '{"power":0.5}');
    await page.evaluate((a) => window.molkky?.throw(a), input);
    for (let i = 0; i < 16; i++) {
      await wait(i < 10 ? 130 : 420);
      await shot(`hit-${String(i).padStart(2, "0")}`);
    }
    const s = await until((x) => x.phase === "aim" || x.phase === "over", 30000);
    await wait(700);
    await shot("hit-after");
    console.log(
      "state",
      JSON.stringify({
        scores: s.scores,
        fps: Math.round(s.fps),
        pins: s.pins.map((p) => `${p.number}${p.state[0]}`).join(" "),
      }),
    );
  }
  if (scenario === "throw" || scenario === "match") {
    await page.mouse.down();
    await wait(700);
    await shot("charge");
    await page.mouse.up();
    await wait(650);
    await shot("flight");
    await wait(500);
    await shot("impact");
    await until((s) => s.phase === "result");
    await wait(300);
    await shot("result");
    const s = await until((x) => x.phase === "aim" || x.phase === "over");
    await wait(600);
    await shot("after");
    console.log(
      "state",
      JSON.stringify({ scores: s.scores, fps: Math.round(s.fps), phase: s.phase }),
    );
  }
  if (scenario === "match") {
    await page.evaluate(() => {
      window.molkky!.speed = 6;
    });
    let throws = 1;
    while (throws < 80) {
      const s = await until((x) => x.phase === "aim" || x.phase === "over", 60000);
      if (s.phase === "over") break;
      const yaw = ((throws * 37) % 11) * 0.006 - 0.03;
      const slice = (throws % 5) * 0.5;
      await page.evaluate((a) => window.molkky?.throw(a), {
        yaw,
        slice,
        power: 0.45 + (throws % 4) * 0.08,
      });
      throws++;
      await wait(150);
    }
    const end = await state();
    await wait(800);
    await shot("over");
    console.log(
      "match",
      JSON.stringify({
        throws: end?.throws,
        scores: end?.scores,
        over: end?.over,
        winner: end?.winner,
      }),
    );
  }
}

console.log(problems.length ? `PROBLEMS\n${problems.join("\n")}` : "no console errors");
await browser.close();
process.exit(problems.some((p) => p.startsWith("pageerror") || p.startsWith("error")) ? 1 : 0);
