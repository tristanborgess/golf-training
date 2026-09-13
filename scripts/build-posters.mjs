/**
 * Photograph the live 3D scene for the poster fallback, so the fallback always
 * matches the viewer. Needs a running production server (`bun run start`).
 *
 *   node scripts/build-posters.mjs [http://127.0.0.1:3001]
 *
 * Writes public/models/poster/<clip>/<phase>.png, 480×640, transparent background.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://127.0.0.1:3001";
const clips = {
  full: "club=7iron",
  chip: "club=sw&shot=chip",
  putt: "club=putter",
};
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader-webgl",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({
  viewport: { width: 560, height: 1100 },
  deviceScaleFactor: 1,
});
await page.emulateMedia({ reducedMotion: "reduce" });
for (const [clip, query] of Object.entries(clips)) {
  await mkdir(`public/models/poster/${clip}`, { recursive: true });
  for (const phase of [0, 1, 2, 3, 4]) {
    await page.goto(
      `${base}/en/?${query}&look=front&phase=${phase}&capture&debug`,
    );
    await page.waitForFunction(() => window.__rangeNotesViewer?.ready, null, {
      timeout: 60000,
    });
    await page.waitForFunction(
      (p) => window.__rangeNotesViewer?.phase === p,
      phase,
    );
    await page.waitForTimeout(600);
    await page.addStyleTag({
      content: "html,body{background:transparent !important}",
    });
    await page.locator(".viewer-stage canvas").screenshot({
      path: `public/models/poster/${clip}/${phase}.png`,
      omitBackground: true,
    });
    console.log(`poster ${clip}/${phase}`);
  }
}
await browser.close();
