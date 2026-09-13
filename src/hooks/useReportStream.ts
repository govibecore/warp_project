import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ReportState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  text: string;
  report: any | null;
}

export function useReportStream(assessmentId: string | null) {
  const [reportState, setReportState] = useState<ReportState>({
    status: 'idle',
    text: '',
    report: null
  });

  useEffect(() => {
    if (!assessmentId) return;

    const channel = supabase.channel(`report:${assessmentId}`)
      .on('broadcast', { event: 'section' }, ({ payload }) => {
        if (payload.section === 'status') {
          setReportState(prev => ({ ...prev, status: 'analyzing', text: payload.text }));
        } else if (payload.section === 'complete') {
          setReportState({ status: 'complete', text: 'Report generated successfully.', report: payload.report });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assessmentId]);

  return reportState;
}
