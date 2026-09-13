// deno-lint-ignore no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// deno-lint-ignore no-import-prefix
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock verify function for local development
function verifyWithDigiLocker(token: string) {
  // In a real app, this would call the DigiLocker/Aadhaar partner API
  return token.startsWith("mock_valid_");
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, studentId, method } = await req.json();

    if (!token || !studentId) {
      throw new Error("Missing token or studentId");
    }

    const verified = verifyWithDigiLocker(token);
    
    if (!verified) {
      return new Response(JSON.stringify({ success: false, error: "Verification failed" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Provide a simple hash stub for the token ref
    const hash = (t: string) => `hash_${t.substring(0, 10)}`;

    const { error } = await supabase.from('students').update({
      consent_status: 'verified',
      consent_method: method || 'mock',
      consent_token_ref: hash(token),
      consent_verified_at: new Date().toISOString(),
      // Re-verify yearly per DPDP Rule 8
      consent_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', studentId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
