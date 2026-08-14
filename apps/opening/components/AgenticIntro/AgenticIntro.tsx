"use client"

import { useCallback, useEffect, useState } from "react"
import "./AgenticIntro.css"

const LETTERS = ["A", "G", "E", "N", "T", "I", "C"]
const LETTER_IN_STAGGER = 90
const LETTER_IN_DUR = 700
const HOLD_DURATION = 300
const LETTERS_IN_TOTAL = LETTER_IN_STAGGER * (LETTERS.length - 1) + LETTER_IN_DUR + HOLD_DURATION
const LETTER_OUT_STAGGER = 55
const LETTER_OUT_DUR = 450
const LETTERS_OUT_TOTAL = LETTER_OUT_STAGGER * (LETTERS.length - 1) + LETTER_OUT_DUR
const CURTAIN_DELAY = LETTERS_IN_TOTAL + 100
const CURTAIN_DURATION = 1300
const ANIM_TOTAL = CURTAIN_DELAY + LETTERS_OUT_TOTAL + 1400

export const INTRO_DURATION_MS = CURTAIN_DELAY + CURTAIN_DURATION
export const HERO_REVEAL_MS = CURTAIN_DELAY + CURTAIN_DURATION - 150

type Phase = "idle" | "in" | "out" | "done"

type AgenticIntroProps = {
  onComplete?: () => void
  className?: string
}

export function AgenticIntro({ onComplete, className = "" }: AgenticIntroProps) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [curtainUp, setCurtainUp] = useState(false)

  const complete = useCallback(() => onComplete?.(), [onComplete])

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("in"), 80)
    const t1 = setTimeout(() => setPhase("out"), LETTERS_IN_TOTAL)
    const t2 = setTimeout(() => setCurtainUp(true), CURTAIN_DELAY)
    const t3 = setTimeout(complete, HERO_REVEAL_MS)
    const t4 = setTimeout(() => setPhase("done"), ANIM_TOTAL)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [complete])

  if (phase === "done") return null

  return (
    <div className={`agentic-intro ${className}`} aria-hidden="true">
      <div
        className="agentic-intro__curtain"
        style={{
          bottom: curtainUp ? "100%" : "0%",
          transition: curtainUp ? "bottom 1.3s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
        }}
      />
      <div className="agentic-intro__letters">
        <div className="agentic-intro__word">
          {LETTERS.map((letter, i) => {
            const isIdle = phase === "idle"
            const isIn = phase === "in"
            const isOut = phase === "out"
            const transition = isOut
              ? `opacity ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${i * LETTER_OUT_STAGGER}ms, filter ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${i * LETTER_OUT_STAGGER}ms, transform ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${i * LETTER_OUT_STAGGER}ms`
              : isIn
                ? `opacity ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${i * LETTER_IN_STAGGER}ms, filter ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${i * LETTER_IN_STAGGER}ms, transform ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${i * LETTER_IN_STAGGER}ms`
                : "none"

            return (
              <span
                key={letter}
                className="agentic-intro__letter"
                style={{
                  opacity: isIdle ? 0 : isIn ? 1 : 0,
                  filter: `blur(${isIdle ? 36 : isIn ? 0 : 24}px)`,
                  transform: `translateY(${isIdle ? 48 : isIn ? 0 : -20}px)`,
                  transition,
                }}
              >
                {letter}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AgenticIntro
