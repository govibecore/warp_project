import { test, expect } from "@chromatic-com/playwright";

test("Multi-step Onboarding Registration Flow", async ({ page }) => {
  await page.goto("/?choose");

  // Verify choose mode options
  await expect(page.getByRole("heading", { name: /Get started/i })).toBeVisible({ timeout: 15000 });

  // Click 'Create free account'
  await page.getByRole("button", { name: /Create free account/i }).click();

  // ── Step 1: Candidate Identity ──
  await expect(page.getByText("Step 01 / 03")).toBeVisible();
  await expect(page.getByText("Candidate Identity")).toBeVisible();
  await expect(page.getByLabel(/Candidate Full Name/i)).toBeVisible();

  // Fill Candidate details
  await page.getByLabel(/Candidate Full Name/i).fill("Maya Lin");
  await page.getByLabel(/Class \/ Grade Level/i).selectOption("8");

  // Proceed to Step 2
  await page.getByRole("button", { name: /Continue to Guardian Details/i }).click();

  // ── Step 2: Guardian & Institution ──
  await expect(page.getByText("Step 02 / 03")).toBeVisible();
  await expect(page.getByText("Guardian & Institution")).toBeVisible();

  // Fill Guardian details
  await page.getByLabel(/Parent \/ Guardian Name/i).fill("Dr. Arthur Lin");
  await page.getByLabel(/School \/ Institution Name/i).fill("Nordic STEM Academy");
  await page.getByLabel(/WhatsApp \/ Contact Number/i).fill("+15551234567");

  // Proceed to Step 3
  await page.getByRole("button", { name: /Continue to Credentials/i }).click();

  // ── Step 3: Access Credentials ──
  await expect(page.getByText("Step 03 / 03")).toBeVisible();
  await expect(page.getByText("Access Credentials")).toBeVisible();

  // Verify Summary Strip
  await expect(page.getByText("Maya Lin (Class 8)")).toBeVisible();
  await expect(page.getByText("Dr. Arthur Lin")).toBeVisible();
  await expect(page.getByText("Nordic STEM Academy")).toBeVisible();

  // Verify DPDP Privacy Assurance Card
  await expect(page.getByText("Encrypted Student Data")).toBeVisible();

  // Verify Email & Password fields are ready
  await expect(page.getByLabel(/Email Address/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Create Account & Begin/i })).toBeVisible();
});

test("Successful Registration shows ONLY Success UI with Lottie and redirects to Login", async ({ page }) => {
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

  // Step 1
  await page.getByLabel(/Candidate Full Name/i).fill("Tom Koo");
  await page.getByLabel(/Class \/ Grade Level/i).selectOption("9");
  await page.getByRole("button", { name: /Continue to Guardian Details/i }).click();

  // Step 2
  await page.getByLabel(/Parent \/ Guardian Name/i).fill("Parent Smith");
  await page.getByLabel(/School \/ Institution Name/i).fill("Warp Academy");
  await page.getByLabel(/WhatsApp \/ Contact Number/i).fill("+15559876543");
  await page.getByRole("button", { name: /Continue to Credentials/i }).click();

  // Step 3
  await page.getByLabel(/Email Address/i).fill("tom123@warp.app");
  await page.getByLabel(/Password/i).fill("SuperSecret123!");

  // Submit Registration
  await page.getByRole("button", { name: /Create Account & Begin/i }).click();

  // Verify ONLY Success UI is shown (form fields and stepper are gone)
  const successCard = page.locator('[data-testid="registration-success-card"]');
  await expect(successCard).toBeVisible();
  await expect(page.getByText("Registration Successful")).toBeVisible();
  await expect(page.getByText("tom123@warp.app")).toBeVisible();

  // Stepper and inputs should no longer be visible
  await expect(page.getByText("Step 03 / 03")).not.toBeVisible();
  await expect(page.getByLabel(/Password/i)).not.toBeVisible();
  await expect(page.getByRole("button", { name: /Create Account & Begin/i })).not.toBeVisible();

  // Verify Lottie animation is present
  await expect(page.getByTestId("lottie-success-container").locator("svg")).toBeVisible();

  // Click direct redirect button
  await page.locator('[data-testid="continue-to-login-btn"]').click();

  // Verify redirected to Login view with email prefilled
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  const emailInput = page.getByLabel(/Email Address/i);
  await expect(emailInput).toBeVisible();
  await expect(emailInput).toHaveValue("tom123@warp.app");
  await expect(page.getByText(/Registration successful! Please check your email inbox/i)).toBeVisible();
});

test("In-tab 6-digit OTP verification flow on registration success card", async ({ page }) => {
  // Mock Supabase sign up endpoint
  await page.route("**/auth/v1/signup*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "mock-user-otp",
        aud: "authenticated",
        role: "authenticated",
        email: "alice@warp.app",
        user_metadata: { full_name: "Alice Wang" },
      }),
    });
  });

  // Mock Supabase verifyOtp endpoint
  await page.route("**/auth/v1/verify*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "mock-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh",
        user: {
          id: "mock-user-otp",
          aud: "authenticated",
          role: "authenticated",
          email: "alice@warp.app",
          email_confirmed_at: "2026-09-13T10:00:00Z",
          user_metadata: { full_name: "Alice Wang", current_class: 8 },
        },
      }),
    });
  });

  // Mock students REST API
  await page.route("**/rest/v1/students*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "mock-user-otp",
        full_name: "Alice Wang",
        current_class: 8,
        consent_status: "verified",
      }),
    });
  });

  await page.goto("/?choose");
  await page.getByRole("button", { name: /Create free account/i }).click();

  // Step 1
  await page.getByLabel(/Candidate Full Name/i).fill("Alice Wang");
  await page.getByLabel(/Class \/ Grade Level/i).selectOption("8");
  await page.getByRole("button", { name: /Continue to Guardian Details/i }).click();

  // Step 2
  await page.getByLabel(/Parent \/ Guardian Name/i).fill("Mr. Wang");
  await page.getByLabel(/School \/ Institution Name/i).fill("International Academy");
  await page.getByLabel(/WhatsApp \/ Contact Number/i).fill("+15550001111");
  await page.getByRole("button", { name: /Continue to Credentials/i }).click();

  // Step 3
  await page.getByLabel(/Email Address/i).fill("alice@warp.app");
  await page.getByLabel(/Password/i).fill("SecurityPassword123!");
  await page.getByRole("button", { name: /Create Account & Begin/i }).click();

  // Verify OTP Card rendered
  await expect(page.getByTestId("registration-success-card")).toBeVisible();
  await expect(page.getByTestId("otp-form")).toBeVisible();
  await expect(page.getByText(/Enter 6-Digit Confirmation Code/i)).toBeVisible();
  await expect(page.getByTestId("resend-otp-btn")).toBeVisible();

  // Enter 6-digit OTP
  for (let i = 0; i < 6; i++) {
    await page.getByTestId(`otp-input-${i}`).fill(String(i + 1));
  }

  // Click Verify Button
  const verifyBtn = page.getByTestId("verify-otp-btn");
  await expect(verifyBtn).toBeEnabled();
  await verifyBtn.click();

  // Verify feedback confirmation
  await expect(page.getByText(/Email verified successfully/i)).toBeVisible();
});

test("Back to home button transitions from ?choose to Landing page cleanly", async ({ page }) => {
  test.slow();
  await page.goto("/?choose");

  // Verify choose screen is visible
  await expect(page.getByRole("heading", { name: /Get started/i })).toBeVisible({ timeout: 15000 });

  // Click 'Back to home'
  const backToHomeBtn = page.getByTestId("back-to-home-btn");
  await expect(backToHomeBtn).toBeVisible();
  await backToHomeBtn.click({ force: true });

  // Verify URL is cleaned of ?choose and landing page is rendered
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /Get started/i })).not.toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: /Start your assessment/i })).toBeVisible({ timeout: 15000 });
});


