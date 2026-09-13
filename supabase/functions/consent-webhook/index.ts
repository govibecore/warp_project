// supabase/functions/consent-webhook/index.ts
// Secure webhook for DigiLocker / Aadhaar / Guardian consent verification callbacks.
// Validates webhook secrets, binds target student ID, and hashes token references.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate webhook callback using server secret
    const webhookSecret = Deno.env.get('CONSENT_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-webhook-secret') || req.headers.get('X-Webhook-Secret');

    if (!webhookSecret || providedSecret !== webhookSecret) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized: Invalid or missing webhook secret" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { studentId, consentToken, providerReference, method } = await req.json();

    if (!studentId || !consentToken || !providerReference) {
      return new Response(JSON.stringify({ success: false, error: "Missing required parameters: studentId, consentToken, providerReference" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Verify target student exists in DB before updating
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id, consent_status')
      .eq('id', studentId)
      .single();

    if (fetchError || !student) {
      return new Response(JSON.stringify({ success: false, error: "Target student not found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // 3. Cryptographic SHA-256 hash of the consent token for secure audit reference
    const encoder = new TextEncoder();
    const data = encoder.encode(consentToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 4. Update student record with verified consent and DPDP Rule 8 expiry
    const { error: updateError } = await supabase.from('students').update({
      consent_status: 'verified',
      consent_method: method || 'digilocker',
      consent_token_ref: `sha256:${tokenHash}`,
      consent_verified_at: new Date().toISOString(),
      // Re-verify yearly per DPDP Rule 8
      consent_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', studentId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, studentId, verifiedAt: new Date().toISOString() }), {
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
