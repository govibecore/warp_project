/**
 * BorderBeam — animated hairline border glow that travels around a container.
 *
 * Uses a CSS custom-property + keyframe approach for maximum cross-browser
 * compatibility (Chrome, Firefox, Safari/WebKit, iOS, Android).
 *
 * The CSS Motion Path API (offset-path: rect()) used by some versions of this
 * component has ZERO support on iOS Safari / WebKit (as of 2026-09) and was
 * replaced here with a pure CSS conic-gradient + rotation animation.
 */

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  /** Pixel duration of one full revolution. Default: 8s */
  duration?: number
  /** Color at beam start */
  colorFrom?: string
  /** Color at beam end */
  colorTo?: string
  /** Width of the animated border stroke in px. Default: 1.5 */
  borderWidth?: number
  /** Size of the beam (ignored, kept for API compatibility) */
  size?: number
  /** Additional class names on the root element */
  className?: string
  /** Reverse animation direction */
  reverse?: boolean
}

export function BorderBeam({
  duration = 8,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  borderWidth = 1.5,
  className,
  reverse = false,
}: BorderBeamProps) {
  const styleKey = `${colorFrom}|${colorTo}|${duration}|${borderWidth}|${reverse}`
  const uid = `bb-${Math.abs(styleKey.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0))}`
  const keyframeName = `${uid}-spin`
  const animationDir = reverse ? "reverse" : "normal"

  const styleContent = `
@keyframes ${keyframeName} {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.${uid}-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
}
.${uid}-wrap::before {
  content: "";
  position: absolute;
  /* Start large enough to cover all edges */
  inset: -100%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg 270deg,
    ${colorFrom} 270deg 310deg,
    ${colorTo} 310deg 360deg
  );
  animation: ${keyframeName} ${duration}s linear infinite ${animationDir};
}
.${uid}-mask {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: ${borderWidth}px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />
      <div className={cn(`${uid}-mask`, className)} aria-hidden="true">
        <div className={`${uid}-wrap`} />
      </div>
    </>
  )
}
