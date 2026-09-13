import { useState } from 'react';
import { Download, Printer, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import html2pdf from 'html2pdf.js';

interface PDFExportButtonProps {
  targetId: string;
  studentName?: string;
  classLevel?: number;
  className?: string;
}

export function PDFExportButton({
  targetId,
  studentName = 'Candidate',
  classLevel = 8,
  className = '',
}: PDFExportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      console.warn(`Element #${targetId} not found for PDF generation. Fallback to print.`);
      window.print();
      return;
    }

    try {
      setStatus('generating');

      const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `WARP_STEM_Benchmark_${cleanName}_Class${classLevel}_${dateStr}.pdf`;

      const options = {
        margin: [10, 8, 10, 8] as [number, number, number, number], // top, right, bottom, left in mm
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: ['.print-keep', '.card', 'header', 'table'],
        },
      };

      // Add temporary class for print styling optimizations
      element.classList.add('pdf-rendering-mode');

      await html2pdf().set(options as any).from(element).save();

      element.classList.remove('pdf-rendering-mode');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('html2pdf generation error, falling back to window.print():', err);
      const el = document.getElementById(targetId);
      if (el) el.classList.remove('pdf-rendering-mode');
      setStatus('error');
      // Fallback to browser print dialog
      window.print();
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      disabled={status === 'generating'}
      className={`gap-2 transition-all ${className}`}
      aria-label="Export official report as PDF"
    >
      {status === 'generating' ? (
        <>
          <Spinner size="sm" className="text-primary" />
          <span>Generating PDF…</span>
        </>
      ) : status === 'success' ? (
        <>
          <Check className="size-4 text-emerald-500" />
          <span>Downloaded PDF</span>
        </>
      ) : status === 'error' ? (
        <>
          <Printer className="size-4 text-amber-500" />
          <span>Printed PDF</span>
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
