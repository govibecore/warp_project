import React from 'react';

interface SocraticMarkdownProps {
  content: string;
  className?: string;
}

/**
 * High-performance, zero-bloat Markdown & LaTeX formatter for Socratic STEM Tutor responses.
 * Parses headers, bolding, numbered steps, bullet lists, math symbols, code, tables, and callouts.
 */
export function SocraticMarkdown({ content, className = '' }: SocraticMarkdownProps) {
  if (!content) return null;

  // Split into lines or blocks
  const rawLines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let listItems: React.ReactNode[] = [];

  const flushTable = (keyIndex: number) => {
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key={`table-${keyIndex}`} className="my-3 overflow-x-auto border border-border bg-surface/50">
          <table className="w-full text-left text-xs border-collapse font-sans">
            {tableHeader.length > 0 && (
              <thead>
                <tr className="border-b border-border bg-accent/30 font-semibold text-foreground">
                  {tableHeader.map((h, i) => (
                    <th key={i} className="p-2 px-3">
                      {renderInlineFormatting(h.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50 last:border-0 hover:bg-accent/10">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2 px-3 text-foreground-secondary">
                      {renderInlineFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = [];
      tableRows = [];
      inTable = false;
    }
  };

  const flushList = (keyIndex: number) => {
    if (inList && listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${keyIndex}`} className="my-2 space-y-1.5 pl-5 list-decimal text-foreground leading-relaxed">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${keyIndex}`} className="my-2 space-y-1.5 pl-5 list-disc text-foreground leading-relaxed">
            {listItems}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Table detection: starts and ends with "|"
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(i);
      // Skip markdown divider line like |---|---|
      if (trimmed.match(/^\|(\s*:?-+:?\s*\|)+$/)) {
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable(i);
    }

    // Numbered list item: e.g. "1. Step" or "1️⃣ Step"
    const olMatch = trimmed.match(/^(\d+[\.\)]|[0-9]️⃣)\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        flushList(i);
        inList = true;
        listType = 'ol';
      }
      listItems.push(
        <li key={`li-${i}`} className="pl-1">
          {renderInlineFormatting(olMatch[2])}
        </li>
      );
      continue;
    }

    // Bulleted list item: e.g. "- Item" or "* Item"
    const ulMatch = trimmed.match(/^[\-\*•]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        flushList(i);
        inList = true;
        listType = 'ul';
      }
      listItems.push(
        <li key={`li-${i}`} className="pl-1">
          {renderInlineFormatting(ulMatch[1])}
        </li>
      );
      continue;
    }

    // Not a list item
    flushList(i);

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    // Block math: $$ ... $$ or \[ ... \]
    if (
      (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) ||
      (trimmed.startsWith('\\[') && trimmed.endsWith('\\]'))
    ) {
      const mathContent = trimmed.replace(/^(\$\$|\\\[)/, '').replace(/(\$\$|\\\])$/, '').trim();
      elements.push(
        <div
          key={`math-block-${i}`}
          className="my-3 overflow-x-auto p-2.5 px-3 bg-surface border-l-2 border-l-primary border-y border-r border-y-border border-r-border font-mono text-[11px] text-foreground tabular"
        >
          {cleanMathFormula(mathContent)}
        </div>
      );
      continue;
    }

    // Headers
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h5 key={`h5-${i}`} className="mt-3 mb-1 text-xs font-bold text-foreground font-display tracking-tight">
          {renderInlineFormatting(trimmed.slice(5))}
        </h5>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      const isCallout = /^[💡⚠️🏆🧠📚📅🏫🔍]/.test(text);
      elements.push(
        <h4
          key={`h4-${i}`}
          className={`mt-4 mb-2 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 ${
            isCallout ? 'text-primary' : 'text-foreground'
          }`}
        >
          {renderInlineFormatting(text)}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 text-sm font-bold text-foreground font-display border-b border-border pb-1">
          {renderInlineFormatting(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-5 mb-2 text-base font-bold text-foreground font-display">
          {renderInlineFormatting(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquotes: > text
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-2.5 pl-3 border-l-2 border-emerald-500/60 bg-emerald-500/5 p-2 text-xs italic text-foreground-secondary"
        >
          {renderInlineFormatting(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed text-foreground">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  flushList(rawLines.length);
  flushTable(rawLines.length);

  return <div className={`space-y-1 text-xs leading-relaxed ${className}`}>{elements}</div>;
}

/**
 * Formats inline Markdown (**bold**, *italic*, `code`, and $math$ formulas).
 */
function renderInlineFormatting(text: string): React.ReactNode {
  // Regex splitting tokens for **bold**, `code`, and \( ... \) or $...$
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\\\(.+?\\\)|\$[^\$]+\$)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return (
        <em key={index} className="italic text-foreground-secondary">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded-none bg-surface border border-border px-1 py-0.5 font-mono text-[11px] text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Inline LaTeX: \( ... \) or $ ... $
    if ((part.startsWith('\\(') && part.endsWith('\\)')) || (part.startsWith('$') && part.endsWith('$'))) {
      const mathStr = part.replace(/^(\\\(|\$)/, '').replace(/(\\\)|\$)$/, '').trim();
      return (
        <span
          key={index}
          className="inline-block mx-0.5 px-1 bg-surface/70 border border-border/80 font-mono text-[11px] text-primary font-semibold tabular"
        >
          {cleanMathFormula(mathStr)}
        </span>
      );
    }

    return part;
  });
}

/**
 * Enhances raw LaTeX formulas into clear typographic symbols for instant reading.
 */
function cleanMathFormula(raw: string): string {
  let cleaned = raw;
  // Common symbols
  cleaned = cleaned.replace(/\\cdot/g, '·');
  cleaned = cleaned.replace(/\\times/g, '×');
  cleaned = cleaned.replace(/\\approx/g, '≈');
  cleaned = cleaned.replace(/\\le/g, '≤');
  cleaned = cleaned.replace(/\\ge/g, '≥');
  cleaned = cleaned.replace(/\\to/g, '→');
  cleaned = cleaned.replace(/\\Delta/g, 'Δ');
  cleaned = cleaned.replace(/\\theta/g, 'θ');
  cleaned = cleaned.replace(/\\pi/g, 'π');
  cleaned = cleaned.replace(/\\alpha/g, 'α');
  cleaned = cleaned.replace(/\\beta/g, 'β');
  cleaned = cleaned.replace(/\\mu/g, 'μ');
  cleaned = cleaned.replace(/\\omega/g, 'ω');
  cleaned = cleaned.replace(/\\sum/g, '∑');
  cleaned = cleaned.replace(/\\infty/g, '∞');
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\\quad/g, '   ');
  cleaned = cleaned.replace(/\\;/g, ' ');
  return cleaned;
}
