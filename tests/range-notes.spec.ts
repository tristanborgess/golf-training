import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { clubs, drawingNamesForTest } from "./support";

test("all clubs and seven drawings work, with keyboard enlargement", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en/");
  for (const club of clubs) {
    await page
      .locator(".club-rail")
      .getByRole("button", { name: club, exact: false })
      .first()
      .click();
    await expect(page.locator(".club-title h2")).toHaveText(club);
  }
  await page
    .locator(".club-rail")
    .getByRole("button", { name: "7-iron" })
    .click();
  for (const drawing of drawingNamesForTest) {
    await page
      .locator(".drawing-tabs")
      .getByRole("button", { name: drawing, exact: true })
      .click();
    await expect(
      page.locator(".drawing-panel svg.golf-diagram").first(),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Enlarge", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Left-handed", exact: true }).click();
  await page
    .locator(".drawing-tabs")
    .getByRole("button", { name: "Stance & ball", exact: true })
    .click();
  await expect(page.locator(".drawing-panel svg").first()).toContainText("←");
  expect(errors).toEqual([]);
});

test("observed flight never reverses with handedness and faults are contextual", async ({
  page,
}) => {
  await page.goto("/en/?view=fix");
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
  await page.getByRole("button", { name: "Left-handed", exact: true }).click();
  await expect(page.locator(".result-top h3")).toHaveText("Push-hook");
  await expect(page.locator(".result-top p")).toContainText(
    "Started left, curved right",
  );
  await page
    .locator(".club-rail")
    .getByRole("button", { name: "Sand wedge" })
    .click();
  await page.getByRole("button", { name: "Bunker", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Left in the sand", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Heavy / fat", exact: true }),
  ).toHaveCount(0);
  await page
    .locator(".club-rail")
    .getByRole("button", { name: "Putter", exact: false })
    .click();
  await expect(page.locator(".direction-questions fieldset")).toHaveCount(1);
  await expect(page.locator(".contact-picker button")).toHaveCount(2);
});

test("carry stays canonical across unit changes, refresh, language and reset", async ({
  page,
}) => {
  await page.goto("/en/?view=bag");
  const field = page.locator("#carry-7iron");
  await field.fill("154");
  await field
    .locator("..")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  const original = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("range-notes:v1") || "{}").carries[
        "7iron"
      ],
  );
  expect(original).toBeCloseTo(140.8176);
  await page.getByRole("button", { name: "m", exact: true }).click();
  await expect(field).toHaveValue("140.8");
  await field
    .locator("..")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await page.getByRole("button", { name: "yd", exact: true }).click();
  await expect(field).toHaveValue("154");
  await page.reload();
  await expect(field).toHaveValue("154");
  await page.getByRole("link", { name: "Cambiar a español" }).click();
  await expect(page.locator("#carry-7iron")).toHaveValue("154");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Oscuro", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page
    .getByRole("button", { name: "Restablecer preferencias", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Restablecer este dispositivo", exact: true })
    .click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Mi bolsa", exact: true }).click();
  await expect(page.locator("#carry-7iron")).toHaveValue("");
});

test("invalid input and corrupt storage recover safely", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("range-notes:v1", "{broken"),
  );
  await page.goto("/en/?view=bag");
  await expect(page.locator("#carry-driver")).toHaveValue("");
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

test("both languages and unvisited pages reload offline after confirmed preparation", async ({
  page,
  context,
}) => {
  await page.goto("/en/");
  await expect(page.locator(".offline-status")).toHaveText("Ready offline", {
    timeout: 25000,
  });
  await context.setOffline(true);
  await page.goto("/es/?view=fix");
  await expect(page.locator(".club-title h2")).toHaveText("Leamos ese golpe.");
  await page.goto("/es/sources/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Un punto de partida útil.",
  );
  await page.goto("/en/?view=bag");
  await expect(page.locator("#carry-driver")).toBeVisible();
});

test("offline preparation failure never reports readiness", async ({
  page,
}) => {
  await page.route("**/precache.json", (route) => route.abort());
  await page.goto("/en/");
  await expect(page.locator(".offline-status")).not.toHaveText("Ready offline");
});

for (const lang of ["en", "es"])
  for (const dark of [false, true])
    test(`${lang} ${dark ? "dark" : "light"} mobile and desktop accessibility`, async ({
      page,
    }) => {
      if (dark)
        await page.addInitScript(() => localStorage.setItem("theme", "dark"));
      await page.goto(`/${lang}/`);
      await expect(page.locator(".club-title h2")).toBeVisible();
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      }
      await page.screenshot({
        path: `test-results/${lang}-${dark ? "dark" : "light"}-mobile.png`,
        fullPage: true,
      });
    });
