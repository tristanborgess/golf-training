import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { clubs } from "../src/lib/golf";
import { clipData } from "../src/lib/swing-data";

async function state(page: Page) {
  return page.evaluate(() => Reflect.get(window, "__rangeNotesViewer"));
}
async function menu(page: Page, name: string) {
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("button", { name, exact: true }).click();
}
async function close(page: Page) {
  await page.getByRole("button", { name: "Close", exact: true }).click();
}
test("every club plays the expected clip; phase controls, view tabs, orbit, overlays and sharing", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en/?debug&club=driver&look=top&phase=2");
  await expect.poll(async () => (await state(page))?.ready).toBe(true);
  expect((await state(page)).look).toBe("top");
  expect((await state(page)).phase).toBe(2);
  await expect(page.getByRole("combobox", { name: "Your club" })).toHaveValue(
    "driver",
  );
  for (const club of clubs) {
    await page.getByRole("combobox").selectOption(club.id);
    const clip = club.system === "putter" ? "putt" : "full";
    await expect.poll(async () => (await state(page)).clipName).toBe(clip);
    await expect
      .poll(async () => (await state(page)).clipDuration)
      .toBeCloseTo(clipData[clip].duration, 4);
  }
  await page.getByRole("combobox").selectOption("sw");
  await page.getByRole("button", { name: "Chip", exact: true }).click();
  await expect.poll(async () => (await state(page)).clipName).toBe("chip");
  await page.getByRole("button", { name: "Pitch", exact: true }).click();
  await expect(page.locator(".swing-cue")).toContainText("approximation");
  await page.getByRole("combobox").selectOption("7iron");
  for (const [i, name] of [
    "Address",
    "Takeaway",
    "Top",
    "Impact",
    "Finish",
  ].entries()) {
    await page
      .locator(".phase-strip")
      .getByRole("button", { name, exact: true })
      .click();
    await expect
      .poll(async () => (await state(page)).t)
      .toBe(clipData.full.markers[i as 0]);
  }
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await state(page)).t, { timeout: 10000 })
    .toBe(1);
  for (const name of ["Side", "Front", "Top", "Back"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  }
  const canvas = page.locator("canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("canvas absent");
  await page.mouse.move(
    bounds.x + bounds.width * 0.5,
    bounds.y + bounds.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height * 0.5,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
  await page.getByRole("button", { name: "Reset view" }).click();
  for (const name of ["Pressure", "Skeleton"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await canvas.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
  await page.getByRole("button", { name: "Reset view" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Skeleton" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(errors).toEqual([]);
});
test("menu exposes six drawings, grip, checklist and carry", async ({
  page,
}) => {
  await page.goto("/en/?debug");
  await menu(page, "Setup checklist");
  for (const name of ["Stance & ball", "Face-on", "Down the line"]) {
    await page
      .locator(".drawing-tabs")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(page.locator(".golf-diagram").first()).toBeVisible();
  }
  await expect(page.locator(".full-checklist")).toContainText("50%");
  await page.getByRole("button", { name: "Enlarge", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Setup checklist", exact: true }),
  ).toBeVisible();
  await close(page);
  for (const name of ["Grip", "Contact", "Face and path"]) {
    await menu(page, name);
    await expect(page.locator(".golf-diagram").first()).toBeVisible();
    if (name === "Grip") {
      await page.getByRole("button", { name: "Strong", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Strong", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    }
    await close(page);
  }
  await menu(page, "Carry");
  await expect(page.locator("#carry-7iron")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".detail-modal")).not.toBeVisible();
});
test("v1 migration, carries, units, hand, theme, locale and reset survive reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("range-notes:v1"))
      localStorage.setItem(
        "range-notes:v1",
        JSON.stringify({
          version: 1,
          hand: "left",
          club: "7iron",
          unit: "yd",
          carries: { "7iron": 140.8176 },
        }),
      );
  });
  await page.goto("/en/?view=bag&debug");
  await expect(page.locator("#carry-7iron")).toHaveValue("154");
  await page.getByRole("button", { name: "m", exact: true }).click();
  await expect(page.locator("#carry-7iron")).toHaveValue("140.8");
  await page.reload();
  await expect(page.locator("#carry-7iron")).toHaveValue("140.8");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("range-notes:v1") || "{}").version,
    ),
  ).toBe(2);
  await close(page);
  await menu(page, "Settings");
  await expect(
    page.getByRole("button", { name: "Left-handed", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("link", { name: "Español", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page
    .getByRole("button", { name: "Restablecer preferencias", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Restablecer este dispositivo", exact: true })
    .click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
test("diagnosis keeps literal flight observations and links sequence faults to the viewer", async ({
  page,
}) => {
  await page.goto("/en/?view=fix&debug");
  await page
    .locator(".direction-questions fieldset")
    .nth(0)
    .getByRole("button", { name: "Left", exact: true })
    .click();
  await page
    .locator(".direction-questions fieldset")
    .nth(1)
    .getByRole("button", { name: "Right", exact: true })
    .click();
  await expect(page.locator(".result-top h3")).toHaveText("Pull-slice");
  await expect(page.locator(".result-top p")).toContainText(
    "Started left, curved right",
  );
  await close(page);
  await menu(page, "Settings");
  await page.getByRole("button", { name: "Left-handed", exact: true }).click();
  await close(page);
  await menu(page, "Fix a shot");
  await page
    .locator(".direction-questions fieldset")
    .nth(0)
    .getByRole("button", { name: "Left", exact: true })
    .click();
  await page
    .locator(".direction-questions fieldset")
    .nth(1)
    .getByRole("button", { name: "Right", exact: true })
    .click();
  await expect(page.locator(".result-top h3")).toHaveText("Push-hook");
  await page.getByRole("button", { name: "Too long", exact: true }).click();
  await page
    .getByRole("button", { name: "Show in the swing", exact: true })
    .click();
  await expect.poll(async () => (await state(page)).phase).toBe(2);
  await expect(
    page.getByRole("button", { name: "Skeleton", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("invalid input and corrupt storage recover safely", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("range-notes:v1", "{bad"),
  );
  await page.goto("/en/?view=bag");
  await page.locator("#carry-driver").fill("-40");
  await page
    .locator("#carry-driver")
    .locator("..")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator("#carry-driver-error")).toContainText(
    "positive distance",
  );
});
test("offline model, both languages and unvisited sources are cached", async ({
  page,
  context,
}) => {
  await page.goto("/en/?debug");
  await expect(page.locator(".offline-status")).toHaveText("Ready offline", {
    timeout: 45000,
  });
  expect(
    await page.evaluate(async () => {
      const names = await caches.keys();
      for (const name of names) {
        if (await (await caches.open(name)).match("/models/golfer.glb"))
          return true;
      }
      return false;
    }),
  ).toBe(true);
  await context.setOffline(true);
  await page.goto("/es/?view=fix");
  await expect(page.locator(".diagnosis")).toBeVisible();
  await page.goto("/es/sources/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Un punto de partida útil.",
  );
  await page.goto("/en/?debug");
  await expect.poll(async () => (await state(page))?.ready).toBe(true);
});
test("offline failure never reports ready", async ({ page }) => {
  await page.route("**/precache.json", (r) => r.abort());
  await page.goto("/en/");
  await expect(page.locator(".offline-status")).not.toHaveText("Ready offline");
});
test("poster fallback supports phases and playback without WebGL", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/en/?poster&debug");
  await expect(page.locator(".poster-fallback")).toContainText(
    "3D unavailable",
  );
  await page
    .locator(".phase-strip")
    .getByRole("button", { name: "Impact", exact: true })
    .click();
  await expect.poll(async () => (await state(page)).phase).toBe(3);
  await expect(page.locator(".poster-fallback img")).toHaveAttribute(
    "src",
    "/models/poster/full/3.png",
  );
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect.poll(async () => (await state(page)).phase).toBe(4);
});
for (const lang of ["en", "es"])
  for (const dark of [false, true])
    test(`${lang} ${dark ? "dark" : "light"} accessible at desktop, mobile and zoom widths`, async ({
      page,
    }) => {
      if (dark)
        await page.addInitScript(() => localStorage.setItem("theme", "dark"));
      await page.goto(`/${lang}/?debug`);
      for (const width of [1440, 390, 320, 195]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect(page.locator(".phase-strip")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(result.violations).toEqual([]);
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: `test-results/${lang}-${dark ? "dark" : "light"}-mobile.png`,
        fullPage: true,
      });
    });
