// Guards: a visible regression on any page at desktop and mobile widths.
import { expect, test } from "@playwright/test";

const pages = {
  home: "/",
};

for (const [name, path] of Object.entries(pages)) {
  test(name, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
