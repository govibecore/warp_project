/**
 * PdfLatexText.tsx
 *
 * Renders LaTeX math inline in a @react-pdf/renderer document.
 *
 * Strategy:
 *   1. Use `latexToSvgString()` (MathJax) to get a full <svg>…</svg> string.
 *   2. Parse the SVG string with `xmldom` to extract path data.
 *   3. Render via @react-pdf/renderer's native <Svg> + <Path> + <G> primitives.
 *
 * Fallback: if parsing fails or the SVG contains unsupported elements,
 *   we fall back to the heuristic `stripLaTeXForPdf()` plain text.
 *
 * Usage:
 *   <PdfLatexText tex="\frac{a}{b}" fontSize={8.5} color="#0f172a" />
 *
 * NOTE: MathJax SVG output uses `currentColor` for strokes/fills. We
 * replace those with the explicit `color` prop so the PDF renders correctly.
 */

import { View, Text, Svg, Path, G } from '@react-pdf/renderer';
import { DOMParser } from 'xmldom';
import { latexToSvgString } from '@/lib/mathJaxSvgRenderer';
import { stripLaTeXForPdf } from '@/lib/mathRender';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PdfLatexTextProps {
  /** Raw LaTeX source (without outer $ delimiters) */
  tex: string;
  fontSize?: number;
  color?: string;
  /** Additional react-pdf style for the wrapper View */
  style?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// SVG Parser helpers
// ---------------------------------------------------------------------------

/** Recursively converts an xmldom Node tree into @react-pdf/renderer JSX elements */
function nodeToReactPdf(
  node: Element,
  scale: number,
  color: string,
  key: string
): React.ReactNode {
  const tag = node.nodeName?.toLowerCase();

  // Resolve fill / stroke — MathJax uses `currentColor` as a placeholder
  const resolvePaint = (val: string | null): string | undefined => {
    if (!val || val === 'none') return val ?? undefined;
    if (val === 'currentColor' || val === 'currentcolor') return color;
    return val;
  };

  const fill = resolvePaint(node.getAttribute?.('fill'));
  const stroke = resolvePaint(node.getAttribute?.('stroke'));
  const strokeWidth = node.getAttribute?.('stroke-width');
  const transform = node.getAttribute?.('transform');

  const childElements = Array.from(node.childNodes ?? []).filter(
    (n) => n.nodeType === 1 // ELEMENT_NODE
  ) as Element[];

  if (tag === 'g') {
    return (
      <G key={key} transform={transform ?? undefined}>
        {childElements.map((child, i) =>
          nodeToReactPdf(child, scale, color, `${key}-${i}`)
        )}
      </G>
    );
  }

  if (tag === 'path') {
    const d = node.getAttribute?.('d');
    if (!d) return null;
    return (
      <Path
        key={key}
        d={d}
        fill={fill ?? color}
        stroke={stroke ?? 'none'}
        strokeWidth={strokeWidth ? parseFloat(strokeWidth) : undefined}
        transform={transform ?? undefined}
      />
    );
  }

  // Recurse into any other container elements (defs are skipped — no 'd' attr)
  if (childElements.length > 0) {
    return (
      <G key={key} transform={transform ?? undefined}>
        {childElements.map((child, i) =>
          nodeToReactPdf(child, scale, color, `${key}-${i}`)
        )}
      </G>
    );
  }

  return null;
}

/** Parse a MathJax SVG string and extract the root <svg> dimensions + child nodes */
function parseSvg(svgString: string): {
  width: number;
  height: number;
  viewBox: string;
  children: Element[];
} | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.documentElement;

    // MathJax encodes dimensions with units like "2.5ex". We normalise to pt.
    const exToPt = (val: string): number => {
      const num = parseFloat(val);
      if (isNaN(num)) return 10;
      // 1ex ≈ 4.5pt at 10pt base, close enough for inline math
      if (val.includes('ex')) return num * 4.5;
      if (val.includes('em')) return num * 6.5;
      return num;
    };

    const rawW = svgEl.getAttribute('width') ?? '10ex';
    const rawH = svgEl.getAttribute('height') ?? '1ex';
    const viewBox = svgEl.getAttribute('viewBox') ?? '0 0 100 10';

    return {
      width: exToPt(rawW),
      height: exToPt(rawH),
      viewBox,
      children: Array.from(svgEl.childNodes).filter(
        (n) => n.nodeType === 1
      ) as Element[],
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a LaTeX formula inside a @react-pdf/renderer document.
 * Falls back to stripped plain text if SVG parsing fails.
 */
export function PdfLatexText({
  tex,
  fontSize = 9,
  color = '#0f172a',
  style,
}: PdfLatexTextProps) {
  // Remove surrounding $ delimiters if the caller passed them
  const cleanTex = tex.replace(/^\$+/, '').replace(/\$+$/, '');

  // 1. Try MathJax → SVG
  const svgString = latexToSvgString(cleanTex, false);

  if (svgString) {
    const parsed = parseSvg(svgString);

    if (parsed) {
      const { width, height, viewBox, children } = parsed;

      // Scale so the rendered height matches the target fontSize
      const scale = fontSize / height;
      const scaledW = width * scale;
      const scaledH = fontSize;

      return (
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', ...style }}>
          <Svg
            width={scaledW}
            height={scaledH}
            viewBox={viewBox}
            style={{ display: 'flex' }}
          >
            {children.map((child, i) =>
              nodeToReactPdf(child, scale, color, `mjx-${i}`)
            )}
          </Svg>
        </View>
      );
    }
  }

  // 2. Fallback: heuristic plain-text strip
  return (
    <Text style={{ fontSize, color, ...style }}>
      {stripLaTeXForPdf(tex)}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Mixed text+math helper
// ---------------------------------------------------------------------------

/**
 * Splits a text string on $…$ and $$…$$ delimiters, rendering plain
 * segments as <Text> and math segments as <PdfLatexText>.
 *
 * Usage:
 *   <PdfMixedText text="Solve $\frac{a}{b} = c$ for $a$." fontSize={9} />
 */
export function PdfMixedText({
  text,
  fontSize = 9,
  color = '#0f172a',
  style,
}: {
  text: string;
  fontSize?: number;
  color?: string;
  style?: Record<string, unknown>;
}) {
  if (typeof text !== 'string') return null;

  // Match currency first so $10.00 doesn't trigger math rendering
  const regex = /(\$\d+(?:,\d{3})*(?:\.\d+)?(?=[\s.,)]|$)(?!\$)|\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  const parts = text.split(regex);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', ...style }}>
      {parts.map((part, i) => {
        // Currency literal — treat as plain text
        if (part.match(/^\$\d+(?:,\d{3})*(?:\.\d+)?$/)) {
          return (
            <Text key={i} style={{ fontSize, color }}>
              {part}
            </Text>
          );
        }

        const isBlock = part.startsWith('$$') && part.endsWith('$$');
        const isInline = !isBlock && part.startsWith('$') && part.endsWith('$');

        if (isBlock || isInline) {
          const inner = isBlock ? part.slice(2, -2) : part.slice(1, -1);
          return (
            <PdfLatexText key={i} tex={inner} fontSize={fontSize} color={color} />
          );
        }

        return (
          <Text key={i} style={{ fontSize, color }}>
            {part}
          </Text>
        );
      })}
    </View>
  );
}
