import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useWarpSession } from '../context/WarpSessionContext';
import { normalizeDifficulty } from '../domain/assessment';
import { Button } from './ui/button';
import { Input, Select, Field } from './ui/input';
import { TriangleAlert, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const CLASSES = Array.from({ length: 10 }, (_, i) => i + 3);

export function ProfileSetup() {
  const { user } = useSupabaseAuth();
  const { setProfile } = useWarpSession();
  const [fullName, setFullName] = useState('');
  const [parentName, setParentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [classLevel, setClassLevel] = useState('8');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill existing data if any
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const { data } = await supabase.from('students').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        if (data.full_name) setFullName(data.full_name);
        if (data.parent_name) setParentName(data.parent_name);
        if (data.school_name) setSchoolName(data.school_name);
        if (data.parent_phone) setWhatsapp(data.parent_phone);
        if (data.current_class) setClassLevel(data.current_class.toString());
      }
    }
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    // Upsert into students table
    const { data: updatedUser, error: updateError } = await supabase
      .from('students')
      .upsert({
        id: user.id,
        full_name: fullName,
        parent_name: parentName,
        school_name: schoolName,
        parent_phone: whatsapp,
        current_class: Number(classLevel),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Set warp session profile to start the assessment
    setProfile({
      name: updatedUser.full_name || 'Learner',
      classLevel: updatedUser.current_class || 8,
      difficulty: normalizeDifficulty(updatedUser.difficulty_pref),
      schoolName: updatedUser.school_name ?? undefined
    });

    setLoading(false);
  };

  return (
    <main className="flex min-h-full w-full flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8" data-testid="profile-setup-shell">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="my-auto z-10 flex w-full max-w-md flex-col items-center gap-5 py-2"
      >
        <div className="text-center">
          <div className="mb-4 inline-flex p-3 bg-surface border border-border rounded-none">
            <Sparkles className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold tracking-tight">
            Complete your profile
          </h1>
          <p className="text-sm leading-relaxed text-foreground-secondary">
            Before we begin the assessment, we need a few more details to ensure your report is accurate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card flex w-full flex-col gap-4 p-6 shadow-sm border border-border corner-marks">
          {error && (
            <div className="flex items-start gap-3 rounded-none border border-destructive/30 bg-destructive-subtle p-3 text-xs text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          <Field label="Full Name" htmlFor="fullName">
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Field>
          <Field label="Parent Name" htmlFor="parentName">
            <Input
              id="parentName"
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
            />
          </Field>
          <Field label="School Name" htmlFor="schoolName">
            <Input
              id="schoolName"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Class" htmlFor="classLevel">
              <Select
                id="classLevel"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                required
              >
                {CLASSES.map((l) => (
                  <option key={l} value={l}>Class {l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Whatsapp Number" htmlFor="whatsapp">
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </Field>
          </div>

          <Button type="submit" disabled={loading} block size="lg" className="mt-2">
            {loading ? 'Saving...' : 'Continue to Assessment'}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
