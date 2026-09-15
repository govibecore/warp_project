import { create } from 'zustand';
import { estimateThetaEAP, IRTResponse } from '../lib/irt/estimate';
import { supabase } from '../lib/supabase';
import { createAndSaveReport } from '../lib/aiService';

/** Safe scenario shape — no irt_a/b/c exposed to client */
export interface Scenario {
  id: string;
  scenario_code: string;
  competency: string;
  class_level?: number;
  international_benchmark?: string;
  prompt: string;
  context_image: string | null;
  options: { text: string; correct: boolean }[];
  learning_objective?: string;
  hint?: string;
}

interface AssessmentState {
  assessmentId: string | null;
  studentId: string | null;
  currentScenario: Scenario | null;
  seenScenarios: string[];
  responses: any[];
  irtResponses: Record<string, IRTResponse[]>;
  theta: Record<string, number>;
  status: 'idle' | 'in_progress' | 'completed' | 'error';
  loading: boolean;
  errorMessage: string | null;
  startTime: number | null;
  subject: string | null;
  startAssessment: (studentId: string, classLevel: number, difficulty: string, subject: string) => Promise<void>;
  submitResponse: (correct: boolean, optionSelected: any) => Promise<void>;
  finishAssessment: () => Promise<void>;
  fetchNextScenario: () => Promise<void>;
  resetAssessment: () => void;
}

export const useAssessment = create<AssessmentState>((set, get) => ({
  assessmentId: null,
  studentId: null,
  currentScenario: null,
  seenScenarios: [],
  responses: [],
  irtResponses: {},
  theta: {},
  status: 'idle',
  loading: false,
  errorMessage: null,
  startTime: null,
  subject: null,

  resetAssessment: () => set({
    assessmentId: null,
    studentId: null,
    currentScenario: null,
    seenScenarios: [],
    responses: [],
    irtResponses: {},
    theta: {},
    status: 'idle',
    loading: false,
    errorMessage: null,
    subject: null,
  }),

  startAssessment: async (studentId, classLevel, difficulty, subject) => {
    const now = Date.now();
    const normalizedSubject = (subject === 'English' || subject === 'English Literacy')
      ? 'English Literacy'
      : (subject || 'STEM');
    set({ loading: true, status: 'in_progress', studentId, seenScenarios: [], responses: [], irtResponses: {}, theta: {}, errorMessage: null, startTime: now, subject: normalizedSubject });
    try {
      const { data: assessment, error } = await supabase.from('assessments').insert({
        student_id: studentId,
        class_level: classLevel,
        difficulty,
        subject: normalizedSubject,
        status: 'in_progress'
      } as any).select().single();

      if (error) throw error;

      set({ assessmentId: assessment.id });
      await get().fetchNextScenario();
    } catch (e: any) {
      console.error('Failed to start assessment', e);
      set({ status: 'error', loading: false, errorMessage: e?.message || 'Failed to start assessment' });
    }
  },

  fetchNextScenario: async () => {
    set({ loading: true, errorMessage: null });
    const { assessmentId, seenScenarios, subject } = get();
    try {
      // Server-authoritative: RPC derives theta & seen items from the assessment record
      const { data, error } = await supabase.rpc('next_scenario', {
        p_assessment: assessmentId || '',
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        if (seenScenarios.length < 5) {
          set({
            status: 'error',
            loading: false,
            errorMessage: `Insufficient scenarios available in the question pool for ${subject || 'this track'}. Please select another track or try again later.`
          });
          return;
        }
        // Pool completed, finish assessment
        await get().finishAssessment();
        return;
      }

      set({ currentScenario: data[0] as any, loading: false });
    } catch (e: any) {
      console.error('Failed to fetch next scenario', e);
      set({ status: 'error', loading: false, errorMessage: e?.message || 'Failed to fetch scenario' });
    }
  },

  submitResponse: async (correct, optionSelected) => {
    const { currentScenario, irtResponses, theta, seenScenarios, responses, assessmentId } = get();
    if (!currentScenario || !assessmentId) return;

    const comp = currentScenario.competency;
    const compResponses = irtResponses[comp] || [];

    // Client-side IRT estimation uses a simplified model since the server
    // holds the authoritative IRT params. We use placeholder params here
    // for real-time theta tracking; the server recalculates authoritatively.
    const newIrtResp: IRTResponse = {
      a: 1.0,  // placeholder — server holds real values
      b: 0.0,  // placeholder — server holds real values
      c: 0.25, // placeholder — server holds real values
      correct
    };

    const updatedCompResponses = [...compResponses, newIrtResp];
    const { theta: newTheta } = estimateThetaEAP(updatedCompResponses);

    const newIrtMap = { ...irtResponses, [comp]: updatedCompResponses };
    const newThetaMap = { ...theta, [comp]: newTheta };
    const newSeen = [...seenScenarios, currentScenario.id];
    
    const newResponseRecord = {
      scenario_id: currentScenario.id,
      prompt: currentScenario.prompt,
      competency: currentScenario.competency,
      benchmarkStandard: currentScenario.international_benchmark || 'International Benchmark',
      userSelectedOption: optionSelected?.text,
      correct,
      option: optionSelected,
      timestamp: new Date().toISOString()
    };
    const newResponses = [...responses, newResponseRecord];

    set({
      irtResponses: newIrtMap,
      theta: newThetaMap,
      seenScenarios: newSeen,
      responses: newResponses,
      currentScenario: null // clear while loading next
    });

    // Persist response update to db before fetching next scenario
    const { error: updateError } = await supabase.from('assessments').update({
      responses: newResponses,
      ability_theta: newThetaMap
    }).eq('id', assessmentId);

    if (updateError) {
      console.warn('Failed to persist assessment response update:', updateError);
    }

    // Full benchmark session: up to 30 items
    if (newSeen.length >= 30) {
      await get().finishAssessment();
    } else {
      await get().fetchNextScenario();
    }
  },

  finishAssessment: async () => {
    set({ loading: true });
    const { assessmentId, studentId, theta, responses, startTime, subject } = get();
    if (!assessmentId) return;

    try {
      const total_time_ms = startTime ? Date.now() - startTime : null;

      // Score each competency
      const scaled_scores: Record<string, number> = {};
      const percentiles: Record<string, number> = {};
      let total_scaled = 0;
      let count = 0;

      for (const [comp, val] of Object.entries(theta)) {
        const { data, error } = await supabase.rpc('score_competency', {
          p_theta: val,
          p_competency: comp,
          p_region: 'global'
        });
        if (!error && data && data.length > 0) {
          scaled_scores[comp] = data[0].scaled_score;
          percentiles[comp] = data[0].percentile;
          total_scaled += data[0].scaled_score;
          count++;
        }
      }

      // Only persist global_score when competency scoring succeeded; do not fabricate median score
      const global_score = count > 0 ? Math.max(100, Math.min(900, Math.round(total_scaled / count))) : undefined;

      const assessmentUpdate: Record<string, any> = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        scaled_scores,
        percentiles,
        ...(global_score !== undefined ? { global_score } : {}),
        total_time_ms
      };

      const { error: updateError } = await supabase.from('assessments').update(assessmentUpdate as any).eq('id', assessmentId);
      if (updateError) {
        console.error('Failed to update assessment completion:', updateError);
      }

      // Auto-generate and save comprehensive dual-audience report immediately
      if (studentId) {
        supabase.from('students').select('full_name, current_class').eq('id', studentId).single().then(({ data: stu }) => {
          createAndSaveReport(
            assessmentId,
            studentId,
            stu?.full_name || 'Candidate',
            stu?.current_class || 8,
            theta,
            responses,
            subject || 'STEM'
          ).catch(err => console.error('Auto report generation error:', err));
        });
      }

      set({ status: 'completed', loading: false });
    } catch (e: any) {
      console.error('Failed to finish assessment', e);
      set({ status: 'error', loading: false, errorMessage: e?.message || 'Failed to complete assessment grading' });
    }
  }
}));
