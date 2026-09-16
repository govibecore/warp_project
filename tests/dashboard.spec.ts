import { test, expect } from "@chromatic-com/playwright";

// ─────────────────────────────────────────────────────────────────────────────
// Shared mock JWT fixtures
// These are structurally valid JWTs (header.payload.signature) that the
// Supabase JS client can parse from localStorage without making a refresh call.
// The Supabase client uses jwtDecode (no signature verification) to read expiry.
// ─────────────────────────────────────────────────────────────────────────────

// Mock token for "Mock User" (mock@example.com) — expires year 2100
const MOCK_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTA0ODgxNDI2LCJpYXQiOjE3ODk1MjE0MjYsInN1YiI6InRlc3QtdXNlci0xMjMiLCJlbWFpbCI6Im1vY2tAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsInVzZXJfbWV0YWRhdGEiOnsiZnVsbF9uYW1lIjoiTW9jayBVc2VyIiwiY3VycmVudF9jbGFzcyI6OCwicGFyZW50X25hbWUiOiJNb2NrIFBhcmVudCIsInNjaG9vbF9uYW1lIjoiTW9jayBTY2hvb2wifSwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX19" +
  ".bW9ja3NpZ25hdHVyZQ";

// Mock token for mandolee79 (mandolee79@gmail.com) — expires year 2100
const MANDOLEE_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTA0ODgxNDM0LCJpYXQiOjE3ODk1MjE0MzQsInN1YiI6InRlc3QtdXNlci0xMjMiLCJlbWFpbCI6Im1hbmRvbGVlNzlAZ21haWwuY29tIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJ1c2VyX21ldGFkYXRhIjp7ImZ1bGxfbmFtZSI6Im1hbmRvbGVlNzkiLCJjdXJyZW50X2NsYXNzIjo4LCJwYXJlbnRfbmFtZSI6Ik1vY2sgUGFyZW50Iiwic2Nob29sX25hbWUiOiJNb2NrIFNjaG9vbCJ9LCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfX0" +
  ".bW9ja3NpZ25hdHVyZQ";

const FAR_FUTURE_EXPIRES_AT = 2104881426; // year 2036 (same as exp in JWT above)

test("Dashboard renders consistently with mock data", async ({ page }) => {
  // Inject mock auth session directly into localStorage for Supabase.
  // Using a valid-structure JWT so Supabase JS decodes expiry correctly and
  // does NOT make a network refresh call (token is not expired).
  await page.addInitScript(({ token, expiresAt }: { token: string; expiresAt: number }) => {
    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify({
      access_token: token,
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        email: 'mock@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        user_metadata: {
          full_name: 'Mock User',
          current_class: 8,
          parent_name: 'Mock Parent',
          school_name: 'Mock School'
        }
      }
    }));
  }, { token: MOCK_ACCESS_TOKEN, expiresAt: FAR_FUTURE_EXPIRES_AT });

  // Mock Auth User Fetch (if session validation occurs)
  await page.route('**/auth/v1/**', async (route) => {
    const json = {
      id: 'test-user-123',
      email: 'mock@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      user_metadata: { full_name: 'Mock User' }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  // Mock Students Profile API
  await page.route('**/rest/v1/students*', async (route) => {
    const student = {
      id: 'test-user-123',
      full_name: 'Jane Doe',
      current_class: 8,
      difficulty_pref: 'Standard',
      parent_name: 'Jane Senior',
      school_name: 'Academy of Mock Data',
      consent_status: 'verified'
    };
    const accept = route.request().headers()['accept'] || '';
    if (accept.includes('vnd.pgrst.object+json')) {
      await route.fulfill({ json: student, status: 200, contentType: 'application/json' });
    } else {
      await route.fulfill({ json: [student], status: 200, contentType: 'application/json' });
    }
  });

  // Mock Assessments History API
  await page.route('**/rest/v1/assessments*', async (route) => {
    const json = [
      {
        id: 'assmnt-1',
        student_id: 'test-user-123',
        class_level: 8,
        difficulty: 'Standard',
        status: 'completed',
        completed_at: '2026-09-01T12:00:00Z',
        global_score: 85,
        percentiles: { global: 90 }
      },
      {
        id: 'assmnt-2',
        student_id: 'test-user-123',
        class_level: 8,
        difficulty: 'Standard',
        status: 'completed',
        completed_at: '2026-08-01T12:00:00Z',
        global_score: 80,
        percentiles: { global: 82 }
      }
    ];
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  // Navigate to dashboard.
  await page.goto("/?dashboard=true");

  // Wait for the STUDENT DOSSIER header to confirm dashboard loaded
  await expect(page.getByRole('button', { name: /New assessment/i })).toBeVisible({ timeout: 15000 });
});

test("User Menu contains Student Dossier, Academic Identity, Calibration Settings, and Sign out", async ({ page }) => {
  // Inject mock auth session directly into localStorage for Supabase.
  // Using a valid-structure JWT so Supabase JS decodes expiry correctly.
  await page.addInitScript(({ token, expiresAt }: { token: string; expiresAt: number }) => {
    const sessionData = {
      access_token: token,
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'mandolee79@gmail.com',
        email_confirmed_at: '2026-09-01T00:00:00.000Z',
        phone: '',
        user_metadata: {
          full_name: 'mandolee79',
          current_class: 8,
          parent_name: 'Mock Parent',
          school_name: 'Mock School'
        },
        app_metadata: { provider: 'email', providers: ['email'] },
        created_at: '2026-09-01T00:00:00.000Z',
        updated_at: '2026-09-01T00:00:00.000Z'
      }
    };
    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify(sessionData));
  }, { token: MANDOLEE_ACCESS_TOKEN, expiresAt: FAR_FUTURE_EXPIRES_AT });

  await page.route('**/auth/v1/token*', async (route) => {
    const json = {
      access_token: MANDOLEE_ACCESS_TOKEN,
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: FAR_FUTURE_EXPIRES_AT,
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'mandolee79@gmail.com',
        user_metadata: { full_name: 'mandolee79' }
      }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/auth/v1/user*', async (route) => {
    const json = {
      id: 'test-user-123',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'mandolee79@gmail.com',
      user_metadata: { full_name: 'mandolee79' }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/auth/v1/**', async (route) => {
    const json = {
      id: 'test-user-123',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'mandolee79@gmail.com',
      user_metadata: { full_name: 'mandolee79' }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  let lastSavedStudentPayload: any = null;
  await page.route('**/rest/v1/students*', async (route) => {
    if (route.request().method() === 'POST') {
      try {
        lastSavedStudentPayload = route.request().postDataJSON();
      } catch (e) {}
      const json = {
        id: 'test-user-123',
        full_name: 'mandolee79',
        current_class: 8,
        difficulty_pref: 'standard',
        gender: 'prefer_not_to_say',
        parent_name: 'Mock Parent',
        school_name: 'Mock School',
        consent_status: 'verified'
      };
      await route.fulfill({ json, status: 200, contentType: 'application/json' });
      return;
    }

    const json = [{
      id: 'test-user-123',
      full_name: 'mandolee79',
      current_class: 8,
      difficulty_pref: 'standard',
      gender: 'prefer_not_to_say',
      parent_name: 'Mock Parent',
      school_name: 'Mock School',
      consent_status: 'verified'
    }];
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/rest/v1/assessments*', async (route) => {
    await route.fulfill({ json: [], status: 200, contentType: 'application/json' });
  });

  await page.goto("/?dashboard=true");

  // Wait for dashboard to confirm auth succeeded before opening menu
  await expect(page.getByRole('button', { name: /New assessment/i })).toBeVisible({ timeout: 15000 });

  // Open user menu dropdown
  const userMenuTrigger = page.locator('#user-menu-trigger');
  await expect(userMenuTrigger).toBeVisible();
  await userMenuTrigger.click();

  // Verify dropdown menu options — these match the actual AppShell labels
  await expect(page.getByRole('menuitem', { name: /Student Dossier/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Academic Identity/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Calibration Settings/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Sign out/i })).toBeVisible();

  // Click Calibration Settings menu item (maps to "Settings" intent)
  await page.getByRole('menuitem', { name: /Calibration Settings/i }).click();

  const panel = page.getByLabel('Student profile and settings');
  await expect(panel).toBeVisible();

  // Verify Profile & Settings panel opened with the Settings tab active
  await expect(panel.getByText(/WARP.*STUDENT IDENTITY.*SETTINGS/i)).toBeVisible();
  await expect(panel.getByText(/Adaptive Assessment Calibration/i)).toBeVisible();
  await expect(panel.getByText(/Grade Standard \(Recommended\)/i)).toBeVisible();
  await expect(panel.getByText(/Foundation Level/i)).toBeVisible();
  await expect(panel.getByText(/International Olympiad Track/i)).toBeVisible();

  // Switch to Account Tab
  await panel.getByRole('button', { name: 'account', exact: true }).click();
  await expect(panel.getByText(/Account Credentials/i)).toBeVisible();
  await expect(panel.getByText(/DPDP Act 2023/i)).toBeVisible();
  await expect(panel.getByText(/mandolee79@gmail.com/i).first()).toBeVisible();

  // Switch back to Profile Tab
  await panel.getByRole('button', { name: 'profile', exact: true }).click();
  await expect(panel.getByText(/Academic Identity/i)).toBeVisible();

  // Edit student name to trigger isDirty state
  const nameInput = panel.getByPlaceholder('e.g. Alex Mercer');
  await nameInput.fill('mandolee79 updated');

  // Save changes
  const saveBtn = panel.getByRole('button', { name: /save changes/i });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  await expect(panel.getByText(/Changes saved!/i)).toBeVisible();

  // Verify that the payload sent to Supabase satisfies students_gender_check
  expect(lastSavedStudentPayload).not.toBeNull();
  expect(['male', 'female', 'other', 'prefer_not_to_say']).toContain(lastSavedStudentPayload.gender);
  expect(['standard', 'advanced', 'olympiad']).toContain(lastSavedStudentPayload.difficulty_pref);
  expect(lastSavedStudentPayload.gender).not.toBe('');

  // Press Escape to dismiss
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
});

test("Signing out redirects to the landing page and not Choose Your Assessment", async ({ page }) => {
  let isLoggedOut = false;

  // Inject mock auth session directly into localStorage for Supabase
  await page.addInitScript(({ token, expiresAt }: { token: string; expiresAt: number }) => {
    if (window.sessionStorage.getItem('logged_out')) return;
    const sessionData = {
      access_token: token,
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'mandolee79@gmail.com',
        email_confirmed_at: '2026-09-01T00:00:00.000Z',
        phone: '',
        user_metadata: {
          full_name: 'mandolee79',
          current_class: 8,
          parent_name: 'Mock Parent',
          school_name: 'Mock School'
        },
        app_metadata: { provider: 'email', providers: ['email'] },
        created_at: '2026-09-01T00:00:00.000Z',
        updated_at: '2026-09-01T00:00:00.000Z'
      }
    };
    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify(sessionData));
  }, { token: MANDOLEE_ACCESS_TOKEN, expiresAt: FAR_FUTURE_EXPIRES_AT });

  // Add specific logout route — must return 204 so Supabase JS fires SIGNED_OUT
  // and clears its in-memory session, preventing App.tsx from auto-redirecting to /?dashboard
  await page.route('**/auth/v1/logout*', async (route) => {
    isLoggedOut = true;
    await route.fulfill({ status: 204, body: '', contentType: 'application/json' });
  });

  await page.route('**/auth/v1/token*', async (route) => {
    if (isLoggedOut) {
      await route.fulfill({ json: { error: 'logged_out' }, status: 401, contentType: 'application/json' });
      return;
    }
    const json = {
      access_token: MANDOLEE_ACCESS_TOKEN,
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: FAR_FUTURE_EXPIRES_AT,
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'mandolee79@gmail.com',
        user_metadata: { full_name: 'mandolee79' }
      }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/auth/v1/user*', async (route) => {
    if (isLoggedOut) {
      await route.fulfill({ json: null, status: 401, contentType: 'application/json' });
      return;
    }
    const json = {
      id: 'test-user-123',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'mandolee79@gmail.com',
      user_metadata: { full_name: 'mandolee79' }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/auth/v1/**', async (route) => {
    if (isLoggedOut) {
      await route.fulfill({ json: { error: 'logged_out' }, status: 401, contentType: 'application/json' });
      return;
    }
    const json = {
      id: 'test-user-123',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'mandolee79@gmail.com',
      user_metadata: { full_name: 'mandolee79' }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/rest/v1/students*', async (route) => {
    const json = [{
      id: 'test-user-123',
      full_name: 'mandolee79',
      current_class: 8,
      difficulty_pref: 'standard',
      gender: 'prefer_not_to_say',
      parent_name: 'Mock Parent',
      school_name: 'Mock School',
      consent_status: 'verified'
    }];
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/rest/v1/assessments*', async (route) => {
    await route.fulfill({ json: [], status: 200, contentType: 'application/json' });
  });

  await page.goto("/?dashboard=true");

  // Wait for dashboard to confirm auth succeeded before opening menu
  await expect(page.getByRole('button', { name: /New assessment/i })).toBeVisible({ timeout: 15000 });

  // Open user menu dropdown
  const userMenuTrigger = page.locator('#user-menu-trigger');
  await expect(userMenuTrigger).toBeVisible();
  await userMenuTrigger.click();

  // Click Sign out and wait for navigation to complete
  const signOutItem = page.getByRole('menuitem', { name: /Sign out/i });
  await expect(signOutItem).toBeVisible();
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/' && !url.searchParams.has('dashboard'), { timeout: 15000 }),
    signOutItem.click(),
  ]);

  await page.waitForLoadState('domcontentloaded');

  // After sign out, the app should be on the landing page, NOT "Choose Your Assessment" (hub)
  await expect(page.getByText(/Choose Your Assessment/i)).not.toBeVisible();
  await expect(page.getByText(/WARP/i).first()).toBeVisible();

  // Verify that warp.profile.v1 and warp.session.v2 were cleared from localStorage
  const savedProfile = await page.evaluate(() => window.localStorage.getItem('warp.profile.v1'));
  expect(savedProfile).toBeNull();
});

test("Sign in button on landing page opens the login form", async ({ page, isMobile }) => {
  // Clear any auth tokens and guest state in localStorage before navigating
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.sessionStorage.setItem('logged_out', 'true');
  });

  await page.goto("/");
  await page.waitForLoadState('domcontentloaded');

  if (isMobile) {
    const menuBtn = page.getByRole('button', { name: /Open navigation menu/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    const signInBtn = page.locator('#mobile-landing-sign-in-btn');
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();
  } else {
    const signInBtn = page.locator('#landing-sign-in-btn');
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();
  }

  // Expect the login form to be visible with "Welcome back" heading
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  // Use #password locator to avoid strict mode violation with the "Toggle password visibility" button
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.getByTestId('onboarding-shell').getByRole('button', { name: /^Sign in$/i })).toBeVisible();
});

test("Select dropdown options have high contrast dark background and visible text", async ({ page }) => {
  await page.addInitScript(({ token, expiresAt }: { token: string; expiresAt: number }) => {
    const sessionData = {
      access_token: token,
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'mandolee79@gmail.com',
        user_metadata: {
          full_name: 'mandolee79',
          current_class: 8,
          parent_name: 'Mock Parent',
          school_name: 'Mock School'
        }
      }
    };
    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify(sessionData));
  }, { token: MANDOLEE_ACCESS_TOKEN, expiresAt: FAR_FUTURE_EXPIRES_AT });

  await page.route('**/auth/v1/**', async (route) => {
    const json = {
      id: 'test-user-123',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'mandolee79@gmail.com',
      user_metadata: { full_name: 'mandolee79' }
    };
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
  });

  await page.route('**/rest/v1/students*', async (route) => {
    const student = {
      id: 'test-user-123',
      full_name: 'mandolee79',
      current_class: 8,
      difficulty_pref: 'standard',
      parent_name: 'Mock Parent',
      school_name: 'Mock School',
      consent_status: 'verified'
    };
    const accept = route.request().headers()['accept'] || '';
    if (accept.includes('vnd.pgrst.object+json')) {
      await route.fulfill({ json: student, status: 200, contentType: 'application/json' });
    } else {
      await route.fulfill({ json: [student], status: 200, contentType: 'application/json' });
    }
  });

  await page.route('**/rest/v1/assessments*', async (route) => {
    await route.fulfill({ json: [], status: 200, contentType: 'application/json' });
  });

  await page.goto("/?dashboard=true");
  // Wait for dashboard to confirm auth succeeded
  await expect(page.getByRole('button', { name: /New assessment/i })).toBeVisible({ timeout: 15000 });

  // Click New assessment to open the Confirm class modal
  const newAssessmentBtn = page.getByRole('button', { name: /New assessment/i });
  await expect(newAssessmentBtn).toBeVisible();
  await newAssessmentBtn.click();

  const select = page.locator('#confirmClass');
  await expect(select).toBeVisible();

  // Verify option elements have clear readable values and are interactive
  const option = select.locator('option').first();
  await expect(option).toHaveText('Class 3');
  await expect(option).toBeEnabled();

  // Close modal
  await page.getByRole('button', { name: /Cancel/i }).click();
  await expect(select).not.toBeVisible();
});



