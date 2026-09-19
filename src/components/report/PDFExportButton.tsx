import { useState } from 'react';
import { Download, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { pdf } from '@react-pdf/renderer';
import { WarpReportPDFDocument } from './pdf/WarpReportPDFDocument';

export interface PDFExportButtonProps {
  studentName?: string;
  classLevel?: number;
  completedAt?: string;
  totalTimeMs?: number;
  overallScore?: number;
  abilityTheta?: number | null;
  benchmark?: any;
  studentVariant?: any;
  parentVariant?: any;
  responses?: any[];
  printMode?: 'one-page' | 'comprehensive';
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  onClose?: () => void;
  // Kept for backwards compatibility
  targetId?: string;
}

export function PDFExportButton({
  studentName = 'Candidate',
  classLevel = 8,
  completedAt = new Date().toISOString(),
  totalTimeMs = 0,
  overallScore = 0,
  abilityTheta = 0,
  benchmark = {},
  studentVariant = {},
  parentVariant = {},
  responses = [],
  printMode = 'one-page',
  className = '',
  variant = 'secondary',
  onClose,
}: PDFExportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleExport = async () => {
    setStatus('generating');
    setErrorMsg('');

    try {
      // Compile pure vector PDF in memory via @react-pdf/renderer
      const blob = await pdf(
        <WarpReportPDFDocument
          studentName={studentName}
          classLevel={classLevel}
          completedAt={completedAt}
          totalTimeMs={totalTimeMs}
          overallScore={overallScore}
          abilityTheta={abilityTheta}
          benchmark={benchmark}
          studentVariant={studentVariant}
          parentVariant={parentVariant}
          responses={responses}
          printMode={printMode}
        />
      ).toBlob();

      // Trigger direct browser download without opening any new tab
      const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename =
        printMode === 'one-page'
          ? `WARP_1Page_Brief_${cleanName}_Class${classLevel}_${dateStr}.pdf`
          : `WARP_Dossier_${cleanName}_Class${classLevel}_${dateStr}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus('success');
      onClose?.();
      setTimeout(() => setStatus('idle'), 3500);
    } catch (err: any) {
      console.error('[PDFExportButton] Export failed:', err);
      setErrorMsg(err?.message ?? 'PDF generation failed');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleExport}
      disabled={status === 'generating'}
      className={`gap-2 whitespace-nowrap transition-all ${className}`}
      aria-label="Export official report as PDF"
      title={status === 'error' ? errorMsg : 'Download vector A4 PDF report'}
    >
      {status === 'generating' ? (
        <>
          <Spinner size="sm" className="text-primary" />
          <span>Generating PDF…</span>
        </>
      ) : status === 'success' ? (
        <>
          <Check className="size-4 text-emerald-500" />
          <span>Downloaded!</span>
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="size-4 text-destructive" />
          <span>Failed</span>
        </>
      ) : (
        <>
          <Download className="size-4" />
          <span>Export PDF</span>
        </>
      )}
    </Button>
  );
}
