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
    const json = [{
      id: 'test-user-123',
      full_name: 'Jane Doe',
      current_class: 8,
      difficulty_pref: 'Standard',
      parent_name: 'Jane Senior',
      school_name: 'Academy of Mock Data',
      consent_status: 'verified'
    }];
    await route.fulfill({ json, status: 200, contentType: 'application/json' });
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
