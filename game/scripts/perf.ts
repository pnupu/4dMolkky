// Measure frame times in headless Chrome: at rest while aiming, and during a throw.
//
//   bun scripts/perf.ts [url]

import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://127.0.0.1:5183/";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: [
    "--enable-gpu",
    "--use-angle=metal",
    "--ignore-gpu-blocklist",
    "--mute-audio",
    // Uncap the frame rate, so the numbers show cost and not the display refresh.
    "--disable-frame-rate-limit",
    "--disable-gpu-vsync",
  ],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.goto(url, { waitUntil: "load" });
await new Promise((r) => setTimeout(r, 2500));
await page.evaluate(() => window.molkky?.start(["You"]));
await new Promise((r) => setTimeout(r, 1500));

const sample = (frames: number) =>
  page.evaluate(
    (n) =>
      new Promise<number[]>((resolve) => {
        const times: number[] = [];
        let last = performance.now();
        const tick = (now: number) => {
          times.push(now - last);
          last = now;
          if (times.length >= n) resolve(times);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    frames,
  );
const report = (name: string, times: number[]) => {
  const sorted = [...times].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  console.log(
    `${name}: median ${at(0.5).toFixed(1)} ms, p95 ${at(0.95).toFixed(1)} ms, max ${at(1).toFixed(1)} ms (${times.length} frames)`,
  );
};

report("aim", await sample(240));
await page.evaluate(() => window.molkky?.throw({ power: 0.5 }));
report("throw", await sample(240));
await browser.close();
