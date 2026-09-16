import { create } from 'zustand';
import { estimateThetaEAP, IRTResponse } from '../lib/irt/estimate';
import { supabase } from '../lib/supabase';
import { createAndSaveReport } from '../lib/aiService';

/** Safe scenario shape - no irt_a/b/c exposed to client */
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
  question_type?: string;
  metadata?: any;
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
      seenScenarios: newSeen,
      responses: newResponses,
      currentScenario: null // clear while loading next
    });

    try {
      // Server-authoritative: Call record_assessment_response to use real item parameters (irt_a, irt_b, irt_c)
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('record_assessment_response', {
        p_assessment: assessmentId,
        p_scenario_id: currentScenario.id,
        p_selected_text: optionSelected?.text || '',
        p_correct: correct,
        p_option: optionSelected || null
      });

      if (!rpcError && rpcData && (rpcData as any).ability_theta) {
        set({ theta: (rpcData as any).ability_theta });
      } else {
        // Fallback: If RPC is not available, calculate locally with realistic item defaults
        console.warn('record_assessment_response RPC fallback:', rpcError);
        const compResponses = irtResponses[comp] || [];
        const newIrtResp: IRTResponse = {
          a: 1.3,
          b: 0.0,
          c: 0.20,
          correct
        };
        const updatedCompResponses = [...compResponses, newIrtResp];
        const { theta: newTheta } = estimateThetaEAP(updatedCompResponses);
        const newThetaMap = { ...theta, [comp]: newTheta };
        set({
          irtResponses: { ...irtResponses, [comp]: updatedCompResponses },
          theta: newThetaMap
        });
        await supabase.from('assessments').update({
          responses: newResponses,
          ability_theta: newThetaMap
        }).eq('id', assessmentId);
      }
    } catch (err) {
      console.error('Failed to record assessment response:', err);
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
      // Guard: Require at least 5 answered questions for a completed diagnostic assessment
      if (responses.length < 5) {
        console.warn(`Assessment has only ${responses.length} responses; minimum 5 required for full diagnostic report.`);
        await supabase.from('assessments').update({
          status: 'in_progress',
          responses
        } as any).eq('id', assessmentId);
        set({ status: 'completed', loading: false });
        return;
      }

      const total_time_ms = startTime ? Date.now() - startTime : null;

      // Score each competency that has recorded theta
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

      if (count === 0 && Object.keys(theta).length > 0) {
        console.error('Competency scoring failed: no competencies could be scored');
        set({ status: 'error', loading: false, errorMessage: 'Failed to calculate competency scores' });
        return;
      }

      // Only compute global score across active, scored competencies
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
        set({ status: 'error', loading: false, errorMessage: 'Failed to save assessment completion' });
        return;
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
