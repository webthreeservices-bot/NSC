'use client'

import { useState, useEffect } from 'react'
import { TextScramble } from "@/components/ui/text-scramble"

interface ContinuousTextScrambleProps {
  text: string
  delay?: number
  className?: string
}

export function ContinuousTextScramble({ 
  text, 
  delay = 0, 
  className = "font-black text-2xl text-[#00ff00]" 
}: ContinuousTextScrambleProps) {
  const [trigger, setTrigger] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initial delay before starting the animation cycle
    const initialTimer = setTimeout(() => {
      setIsInitialized(true)
      setTrigger(true)
    }, delay)

    return () => clearTimeout(initialTimer)
  }, [delay])

  useEffect(() => {
    if (!isInitialized) return

    // Set up continuous animation every 5 seconds
    const interval = setInterval(() => {
      setTrigger(prev => !prev)
    }, 5000)

    return () => clearInterval(interval)
  }, [isInitialized])

  const handleScrambleComplete = () => {
    // Animation completed, will trigger again in 5 seconds
  }

  return (
    <TextScramble
      className={className}
      duration={1.5}
      speed={0.05}
      trigger={trigger}
      onScrambleComplete={handleScrambleComplete}
    >
      {text}
    </TextScramble>
  )
}
