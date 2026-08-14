"use client"

import { useCallback } from "react"
import { AgenticIntro } from "@/components/AgenticIntro/AgenticIntro"

export default function Page() {
  const handleIntroComplete = useCallback(() => {
    // The reusable intro exposes completion for the host page to coordinate with.
  }, [])

  return <AgenticIntro onComplete={handleIntroComplete} />
}
