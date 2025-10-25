import { useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

export type RevealProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Translate in Y from top (negative) in px. Default 12. */
  y?: number
  /** Animation duration in seconds. Default 0.45 */
  duration?: number
  /** Initial delay in seconds. */
  delay?: number
  /** Portion of element that must be visible to trigger (0..1). Default 0.15 */
  amount?: number
  /** Scale start value to mimic map intro. Default 0.94 */
  scaleFrom?: number
  /** Rotation start in degrees to mimic map intro. Default -2 */
  rotateFrom?: number
  /** Optional border-radius morph start (px). If provided, animates to current radius. */
  borderRadiusFrom?: number
}

/**
 * Subtle, one-time scroll-reveal for any section.
 * Now also scales/rotates like the map intro (respecting reduced-motion).
 */
export default function Reveal({
  children,
  className,
  style,
  y = 12,
  duration = 0.75,
  delay = 0,
  amount = 0.25,
  scaleFrom = 0.84,
  rotateFrom = -5,
  borderRadiusFrom,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const inView = useInView(ref, { once: true, amount })

  const hidden = prefersReducedMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: -Math.abs(y),
        scale: scaleFrom,
        rotate: rotateFrom,
        ...(typeof borderRadiusFrom === 'number' ? { borderRadius: borderRadiusFrom } : {}),
      }
  const shown = prefersReducedMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        ...(typeof borderRadiusFrom === 'number' ? { borderRadius: undefined } : {}),
      }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? 'shown' : 'hidden'}
      variants={{ hidden, shown }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
