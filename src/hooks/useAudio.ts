'use client'

import { useState, useCallback } from 'react'

export function useAudio() {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [backgroundMusic, setBackgroundMusic] = useState(false)

  const enableAudio = useCallback(() => {
    setAudioEnabled(true)
  }, [])

  const playBackgroundMusic = useCallback(() => {
    if (audioEnabled) {
      setBackgroundMusic(true)
    }
  }, [audioEnabled])

  const stopBackgroundMusic = useCallback(() => {
    setBackgroundMusic(false)
  }, [])

  return {
    audioEnabled,
    backgroundMusic,
    enableAudio,
    playBackgroundMusic,
    stopBackgroundMusic
  }
}
