import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'wisesota61@gmail.com',
    password: 'Test@2026'
  });

  if (authError || !user) {
    console.log("Failed to login as user. Trying to sign up.");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'wisesota61@gmail.com',
      password: 'Test@2026'
    });
    if (signUpError) {
      console.error("Sign up failed:", signUpError);
      return;
    }
    console.log("Signed up user:", signUpData.user?.id);
  } else {
    console.log("Logged in user:", user.id);
    
    // Seed student profile
    const { error: profileError } = await supabase
      .from('students')
      .upsert({
        id: user.id,
        full_name: 'TestSprite Auto User',
        school_name: 'Test High School',
        current_class: 8,
        difficulty_pref: 'standard',
        consent_status: 'verified',
        consent_verified_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
    if (profileError) {
      console.error("Profile update failed:", profileError);
    } else {
      console.log("User profile seeded successfully.");
    }
  }

  // Seed Admin user
  const { data: { user: adminUser }, error: adminAuthError } = await supabase.auth.signInWithPassword({
    email: 'admin@wisesota.com',
    password: 'Test@2026'
  });

  if (adminAuthError || !adminUser) {
    console.log("Failed to login as admin. Trying to sign up.");
    const { data: adminSignUpData, error: adminSignUpError } = await supabase.auth.signUp({
      email: 'admin@wisesota.com',
      password: 'Test@2026'
    });
    if (adminSignUpError) {
      console.error("Admin sign up failed:", adminSignUpError);
    } else {
      console.log("Signed up admin user:", adminSignUpData.user?.id);
    }
  } else {
    console.log("Logged in admin user:", adminUser.id);
  }
}

main();
