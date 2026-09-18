import { InlineMath, BlockMath } from 'react-katex';

export function renderTextWithMath(text: string) {
  if (typeof text !== 'string') return text;
  
  // This regex matches $$...$$ or $...$ safely.
  const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
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
