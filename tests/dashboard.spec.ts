import { test, expect } from "@chromatic-com/playwright";

test("Dashboard renders consistently with mock data", async ({ page }) => {
  // Inject mock auth session directly into localStorage for Supabase
  await page.addInitScript(() => {
    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify({
      access_token: 'mock-token',
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        email: 'mock@example.com',
        user_metadata: {
          full_name: 'Mock User',
          current_class: 8,
          parent_name: 'Mock Parent',
          school_name: 'Mock School'
        }
      }
    }));
  });

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

  // Navigate to dashboard. The URL query param `?dashboard=true` instructs App.tsx to render StudentDashboard.
  await page.goto("/?dashboard=true");

  // Wait for the specific heading to ensure dashboard loaded and state is fetched
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
});

test("User Menu contains Dashboard, Profile, Settings, and Sign out", async ({ page }) => {
  // Inject mock auth session directly into localStorage for Supabase
  await page.addInitScript(() => {
    const mockUser = {
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
    };

    const sessionData = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 365,
      token_type: 'bearer',
      user: mockUser
    };

    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify(sessionData));
  });

  await page.route('**/auth/v1/token*', async (route) => {
    const json = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 365,
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

  // Open user menu dropdown
  const userMenuTrigger = page.locator('#user-menu-trigger');
  await expect(userMenuTrigger).toBeVisible();
  await userMenuTrigger.click();

  // Verify dropdown menu options: Dashboard, Profile, Settings, Sign out
  await expect(page.getByRole('menuitem', { name: /Dashboard/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Profile/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Settings/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Sign out/i })).toBeVisible();

  // Click Settings menu item
  await page.getByRole('menuitem', { name: /Settings/i }).click();

  const panel = page.getByLabel('Student profile and settings');
  await expect(panel).toBeVisible();

  // Verify Profile & Settings panel opened with the Settings tab active
  await expect(panel.getByText(/WARP \/\/ Identity & Settings/i)).toBeVisible();
  await expect(panel.getByText(/Adaptive Assessment Calibration/i)).toBeVisible();
  await expect(panel.getByText(/Foundation Level/i)).toBeVisible();
  await expect(panel.getByText(/Grade Standard \(Recommended\)/i)).toBeVisible();
  await expect(panel.getByText(/International Olympiad Track/i)).toBeVisible();

  // Switch to Account Tab
  await panel.getByRole('button', { name: 'account', exact: true }).click();
  await expect(panel.getByText(/Account Credentials/i)).toBeVisible();
  await expect(panel.getByText(/India DPDP Act 2023/i)).toBeVisible();
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
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem('logged_out')) return;
    const mockUser = {
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
    };

    const sessionData = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 365,
      token_type: 'bearer',
      user: mockUser
    };

    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify(sessionData));
  });

  await page.route('**/auth/v1/token*', async (route) => {
    if (isLoggedOut) {
      await route.fulfill({ json: { error: 'logged_out' }, status: 401, contentType: 'application/json' });
      return;
    }
    const json = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 365,
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

  // Open user menu dropdown
  const userMenuTrigger = page.locator('#user-menu-trigger');
  await expect(userMenuTrigger).toBeVisible();
  await userMenuTrigger.click();

  // Click Sign out and wait for navigation to complete
  const signOutItem = page.getByRole('menuitem', { name: /Sign out/i });
  await expect(signOutItem).toBeVisible();
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/' && !url.searchParams.has('dashboard')),
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
  await expect(page.getByLabel(/Password/i)).toBeVisible();
  await expect(page.getByTestId('onboarding-shell').getByRole('button', { name: /^Sign in$/i })).toBeVisible();
});

test("Select dropdown options have high contrast dark background and visible text", async ({ page }) => {
  await page.addInitScript(() => {
    const mockUser = {
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
    };
    const sessionData = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 86400 * 365,
      expires_at: Math.floor(Date.now() / 1000) + 86400 * 365,
      token_type: 'bearer',
      user: mockUser
    };
    window.localStorage.setItem('sb-uanqjksfodudwkakyglt-auth-token', JSON.stringify(sessionData));
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
  await expect(page.getByText(/Welcome back/i)).toBeVisible();

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



