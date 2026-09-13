import { test, expect } from "@chromatic-com/playwright";

test("Homepage", async ({ page }) => {
  await page.goto("/");
  // Check for the title to verify it loaded
  await expect(page).toHaveTitle(/WARP/i);
});
