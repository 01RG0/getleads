"use client"

import { useCallback } from "react"
import { AgenticIntro } from "@/components/opening/AgenticIntro/AgenticIntro"

export default function IntroPage() {
  const handleIntroComplete = useCallback(() => {}, [])
  return <AgenticIntro onComplete={handleIntroComplete} />
}
