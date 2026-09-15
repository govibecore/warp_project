import { test, expect } from "@chromatic-com/playwright";

test.describe("English Assessment Pool and Functionality", () => {
  test("Assessment Hub displays English Literacy track and launches successfully", async ({ page }) => {
    // Navigate as guest to setup flow
    await page.goto("/?guest");

    // Fill guest profile fields
    const nameInput = page.locator("#guest-name");
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill("English Scholar");

    const schoolInput = page.locator("#guest-school");
    await schoolInput.fill("Warp Global Academy");

    // Select Class 12 to specifically verify highest band that previously had 0 items
    const classSelect = page.locator("#guest-class");
    await classSelect.selectOption("12");

    // Submit guest onboarding
    await page.getByTestId("onboarding-submit").click();

    // Expect to see Choose Your Assessment Hub
    const hubShell = page.getByTestId("hub-shell");
    await expect(hubShell).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Choose Your Assessment/i })).toBeVisible();

    // Verify both STEM and English Literacy tracks exist
    await expect(page.getByRole("heading", { name: /STEM Benchmark/i })).toBeVisible();
    const englishHeading = page.getByRole("heading", { name: /English Literacy/i });
    await expect(englishHeading).toBeVisible();

    // Select English Literacy track
    const englishCard = page.locator("button").filter({ hasText: "English Literacy" });
    await englishCard.click();

    // Tutorial shell should be visible
    const tutorialShell = page.getByTestId("tutorial-shell");
    await expect(tutorialShell).toBeVisible({ timeout: 10000 });
    const tutorialStartBtn = page.getByTestId("tutorial-start-btn");
    await expect(tutorialStartBtn).toBeVisible({ timeout: 10000 });
    await tutorialStartBtn.click();

    // Verify assessment shell is loaded
    const assessmentShell = page.getByTestId("assessment-shell");
    await expect(assessmentShell).toBeVisible({ timeout: 15000 });

    // CRITICAL: Ensure the insufficient pool error message is NOT present
    await expect(page.getByText(/Insufficient scenarios available/i)).not.toBeVisible();
    await expect(page.getByText(/Unable to load assessment/i)).not.toBeVisible();

    // Ensure scenario question text is loaded
    const questionHeading = page.locator("h1");
    await expect(questionHeading).toBeVisible({ timeout: 10000 });
    const headingText = await questionHeading.textContent();
    expect(headingText?.length).toBeGreaterThan(10);

    // Verify formatted competency badge is displayed and not raw camelCase
    const competencyBadge = page.locator("span.uppercase.tracking-widest.text-primary");
    await expect(competencyBadge).toBeVisible();
    const compText = await competencyBadge.textContent();
    expect(compText).not.toBe("evaluatingReflecting");
    expect(compText).not.toBe("locatingInformation");

    // Verify option labels are displayed and selectable
    const optionLabels = page.locator('label:has(input[name="assessment-option"])');
    await expect(optionLabels.first()).toBeVisible();
    await optionLabels.first().click();

    // Verify Lock response button becomes enabled and can be submitted
    const lockBtn = page.getByRole("button", { name: /Lock response/i });
    await expect(lockBtn).toBeEnabled();
    await lockBtn.click();

    // Next question should load or progress indicator updates to Question 2
    await expect(page.getByText(/Question 2 of 30/i)).toBeVisible({ timeout: 10000 });
  });
});
