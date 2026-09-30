// Guards: a visible regression on any page (layout, colour, spacing, copy) at
// desktop and mobile widths.
import { expect, test, type Page } from "@playwright/test";

const pages = {
  home: "/",
  projects: "/projects",
  contact: "/contact",
  project: "/projects/personal-website",
  architecture: "/projects/personal-website/architecture",
  // Renders its "not connected" state: the run has no Amplitude keys.
  stats: "/projects/personal-website/stats",
  "not-found": "/this-page-does-not-exist",
};

/** Lazy images below the fold never load in a full-page screenshot. */
async function loadAllImages(page: Page) {
  await page.evaluate(async () => {
    const images = [...document.images];
    for (const image of images) image.loading = "eager";
    await Promise.all(images.map((image) => image.decode().catch(() => {})));
  });
}

for (const [name, path] of Object.entries(pages)) {
  test(name, async ({ page }) => {
    await page.goto(path);
    await loadAllImages(page);
    // Playwright's default comparison: only anti-aliasing noise is tolerated.
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      // The copyright year is the one thing that changes with the calendar.
      mask: [page.getByText(/© \d{4}/)],
    });
  });
}
