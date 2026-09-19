/**
 * mathJaxSvgRenderer.ts
 *
 * Converts LaTeX strings to SVG markup strings using MathJax 3 in a browser/node context.
 * Used by the PDF dossier to render accurate mathematical equations.
 *
 * Note: mathjax-full is the v3 package; v4 lives under @mathjax/src (scoped).
 */

import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

// Singleton document to avoid re-creating the adaptor on every render.
let _document: ReturnType<typeof mathjax.document> | null = null;
let _adaptor: ReturnType<typeof liteAdaptor> | null = null;

function getDocument() {
  if (!_document) {
    _adaptor = liteAdaptor();
    RegisterHTMLHandler(_adaptor);
    _document = mathjax.document('', {
      InputJax: new TeX({ packages: AllPackages }),
      OutputJax: new SVG({ fontCache: 'none' }),
    });
  }
  return { doc: _document, adaptor: _adaptor! };
}

/**
 * Converts a LaTeX string to a self-contained SVG markup string.
 * @param tex  The LaTeX source (without surrounding $…$ delimiters).
 * @param display  If true, renders in display (block) mode. Defaults to false (inline).
 * @returns SVG markup string, or an empty string on error.
 */
export function latexToSvgString(tex: string, display = false): string {
  try {
    const { doc, adaptor } = getDocument();
    const node = doc.convert(tex, { display });
    // outerHTML gives us the full <svg>…</svg> string
    return adaptor.outerHTML(node);
  } catch (err) {
    console.error('[mathJaxSvgRenderer] Failed to convert LaTeX:', tex, err);
    return '';
  }
}
