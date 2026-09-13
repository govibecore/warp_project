import { test, expect } from "@chromatic-com/playwright";

test("Onboarding Registration Flow displays registration form", async ({ page }) => {
  await page.goto("/?choose");

  // Verify choose mode options
  await expect(page.getByRole("heading", { name: /Get started/i })).toBeVisible({ timeout: 15000 });

  // Click 'Create free account'
  await page.getByRole("button", { name: /Create free account/i }).click();

  // Verify Email & Password fields are displayed for registration
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Sign up$/i })).toBeVisible();
});

test("Successful Registration shows confirmation notice", async ({ page }) => {
  // Mock Supabase sign up endpoint
  await page.route("**/auth/v1/signup*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "mock-user-456",
        aud: "authenticated",
        role: "authenticated",
        email: "tom123@warp.app",
        user_metadata: {
          full_name: "Tom Koo",
        },
      }),
    });
  });

  await page.goto("/?choose");
  await page.getByRole("button", { name: /Create free account/i }).click();

  await page.getByLabel(/Email/i).fill("tom123@warp.app");
  await page.getByLabel(/Password/i).fill("SuperSecret123!");
  await page.getByRole("button", { name: /^Sign up$/i }).click();

  // Notice should be displayed
  await expect(page.getByText(/Registration successful|Account created/i)).toBeVisible({ timeout: 10000 });
});

test("Sign in mode renders credentials form", async ({ page }) => {
  await page.goto("/?choose");
  await page.getByRole("button", { name: /Sign in Continue where you left off/i }).click();

  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();
  await expect(page.locator('form').getByRole("button", { name: /^Sign in$/i })).toBeVisible();
});

test("Back to home button transitions from ?choose to Landing page cleanly", async ({ page }) => {
  await page.goto("/?choose");

  // Click 'Back to home'
  const backToHomeBtn = page.getByTestId("back-to-home-btn");
  await expect(backToHomeBtn).toBeVisible({ timeout: 10000 });
  await backToHomeBtn.click({ force: true });

  // Verify URL is cleaned of ?choose and landing page is rendered
  await page.waitForURL((url) => !url.searchParams.has("choose"), { timeout: 10000 });
  await expect(page).not.toHaveURL(/\?choose/);
  await expect(page).toHaveTitle(/WARP/i);
});
