import { test, expect } from "@chromatic-com/playwright";

// Mock token for "Mock User" (mock@example.com) — expires year 2100
const MOCK_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTA0ODgxNDI2LCJpYXQiOjE3ODk1MjE0MjYsInN1YiI6InRlc3QtdXNlci0xMjMiLCJlbWFpbCI6Im1vY2tAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsInVzZXJfbWV0YWRhdGEiOnsiZnVsbF9uYW1lIjoiTW9jayBVc2VyIiwiY3VycmVudF9jbGFzcyI6OCwicGFyZW50X25hbWUiOiJNb2NrIFBhcmVudCIsInNjaG9vbF9uYW1lIjoiTW9jayBTY2hvb2wifSwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX19" +
  ".bW9ja3NpZ25hdHVyZQ";

const FAR_FUTURE_EXPIRES_AT = 2104881426;

test.describe("English Assessment Pool and Functionality", () => {
  test("Assessment Hub displays English Literacy track and launches successfully", async ({ page }) => {
    // Mock Supabase Auth
    await page.route('**/auth/v1/user', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'test@warp.academy'
        })
      });
    });

    // Mock Supabase DB: students
    await page.route('**/rest/v1/students*', async route => {
      if (route.request().method() === "PATCH" || route.request().method() === "POST") {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
        return;
      }
      
      const student = {
        id: 'test-user-id',
        full_name: 'English Scholar',
        current_class: 12,
        parent_name: 'Parent',
        school_name: 'Warp Global Academy'
      };

      const accept = route.request().headers()['accept'] || '';
      if (accept.includes('vnd.pgrst.object+json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(student)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([student])
        });
      }
    });
    
    // Mock Supabase DB: assessments
    await page.route('**/rest/v1/assessments*', async route => {
      if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-assessment-123',
            student_id: 'test-user-id',
            status: 'in_progress',
            class_level: 12,
            difficulty: 'Standard',
            subject: 'English Literacy'
          })
        });
        return;
      }
      
      const accept = route.request().headers()['accept'] || '';
      if (accept.includes('vnd.pgrst.object+json')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    // Mock RPC next_scenario
    await page.route('**/rest/v1/rpc/next_scenario*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'mock-scenario-1',
          prompt: 'This is a long mock question prompt for the English Literacy test.',
          competency: 'locatingInformation',
          options: [
            { text: 'Option A', correct: true },
            { text: 'Option B', correct: false },
            { text: 'Option C', correct: false },
            { text: 'Option D', correct: false }
          ]
        }])
      });
    });

    // Mock RPC record_assessment_response
    await page.route('**/rest/v1/rpc/record_assessment_response*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ability_theta: { locatingInformation: 0.5 }
        })
      });
    });

    // Navigate to dashboard with fake auth token in localStorage to bypass initial redirect
    await page.addInitScript(({ token, expiresAt }) => {
      window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify({
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: expiresAt,
        refresh_token: 'fake-refresh-token',
        user: { id: 'test-user-id' }
      }));
    }, { token: MOCK_ACCESS_TOKEN, expiresAt: FAR_FUTURE_EXPIRES_AT });

    await page.goto("/?dashboard");

    // Click "Start Assessment"
    const newAssessmentBtn = page.getByRole("button", { name: /Start Assessment/i });
    await expect(newAssessmentBtn).toBeVisible({ timeout: 10000 });
    await newAssessmentBtn.click();

    // Confirm class in modal
    const modal = page.locator('.fixed.inset-0.z-50');
    const confirmBtn = modal.getByRole("button", { name: "Start Assessment" });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

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
    const questionHeading = page.locator(".text-balance.text-lg");
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
    const lockBtn = page.getByRole("button", { name: /^Lock/i }).first();
    await expect(lockBtn).toBeEnabled();
    await lockBtn.click();

    // Next question should load or progress indicator updates to Question 2
    await expect(page.getByText(/Question 2 of 30/i)).toBeVisible({ timeout: 10000 });
  });
});
