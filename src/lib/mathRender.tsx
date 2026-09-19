import { InlineMath, BlockMath } from 'react-katex';

export function renderTextWithMath(text: string) {
  if (typeof text !== 'string') return text;
  
  // This regex matches currency first, then $$...$$, then $...$.
  const regex = /(\$\d+(?:,\d{3})*(?:\.\d+)?(?=[\s.,)]|$)(?!\$)|\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // If it's a currency token (starts with $ and a digit), return as regular text.
    if (part.match(/^\$\d+(?:,\d{3})*(?:\.\d+)?$/)) {
      return <span key={index}>{part}</span>;
    } else if (part.startsWith('$$') && part.endsWith('$$')) {
      return (
        <span key={index} className="block my-4">
          <BlockMath math={part.slice(2, -2)} renderError={(error: any) => {
            console.error('KaTeX error:', error);
            return <span className="text-destructive font-mono">{part}</span>;
          }} />
        </span>
      );
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <InlineMath key={index} math={part.slice(1, -1)} renderError={(error: any) => {
          console.error('KaTeX error:', error);
          return <span className="text-destructive font-mono">{part}</span>;
        }} />
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function stripLaTeXForPdf(text: string): string {
  if (typeof text !== 'string') return text;
  
  const regex = /(\$\d+(?:,\d{3})*(?:\.\d+)?(?=[\s.,)]|$)(?!\$)|\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  const parts = text.split(regex);
  
  return parts.map(part => {
    if (part.match(/^\$\d+(?:,\d{3})*(?:\.\d+)?$/)) {
      return part;
    } else if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('$') && part.endsWith('$'))) {
      const isBlock = part.startsWith('$$');
      let math = isBlock ? part.slice(2, -2) : part.slice(1, -1);
      
      // Basic heuristic replacements for common LaTeX to Unicode
      math = math.replace(/\\times/g, '×');
      math = math.replace(/\\alpha/g, 'α');
      math = math.replace(/\\beta/g, 'β');
      math = math.replace(/\\gamma/g, 'γ');
      math = math.replace(/\\theta/g, 'θ');
      math = math.replace(/\\pi/g, 'π');
      math = math.replace(/\\sigma/g, 'σ');
      math = math.replace(/\\Delta/g, 'Δ');
      math = math.replace(/\\le/g, '≤');
      math = math.replace(/\\ge/g, '≥');
      math = math.replace(/\\neq/g, '≠');
      math = math.replace(/\\approx/g, '≈');
      math = math.replace(/\\pm/g, '±');
      math = math.replace(/\\circ/g, '°');
      math = math.replace(/\\cdot/g, '·');
      math = math.replace(/\\infty/g, '∞');
      math = math.replace(/\\sqrt\{([^}]+)\}/g, '√$1');
      math = math.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
      math = math.replace(/\\text\{([^}]+)\}/g, '$1');
      math = math.replace(/\\log_([^{]|\{[^}]+\})/g, 'log_$1');
      math = math.replace(/\\mathrm\{([^}]+)\}/g, '$1');
      math = math.replace(/\\mathbf\{([^}]+)\}/g, '$1');
      math = math.replace(/\\ /g, ' '); // backslash space
      
      // Clean up brackets from superscripts and subscripts loosely
      math = math.replace(/\^\{([^}]+)\}/g, '^$1');
      math = math.replace(/_\{([^}]+)\}/g, '_$1');
      
      // Remove any remaining unrecognized macros loosely
      math = math.replace(/\\[a-zA-Z]+/g, '');
      
      return math.trim();
    }
    return part;
  }).join('');
}
