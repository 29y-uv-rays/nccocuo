'use client'

import { useEffect, useRef } from 'react'

interface AudioManagerProps {
  playBackgroundMusic?: boolean
  playButtonClick?: boolean
  playError?: boolean
  playSuccess?: boolean
  playExplosion?: boolean
  playAlarm?: boolean
}

export default function AudioManager({
  playBackgroundMusic = false,
  playButtonClick = false,
  playError = false,
  playSuccess = false,
  playExplosion = false,
  playAlarm = false
}: AudioManagerProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const backgroundMusicRef = useRef<AudioBufferSourceNode | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const createOscillator = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }

  const playBackgroundMusicLoop = () => {
    if (!audioContextRef.current || backgroundMusicRef.current) return

    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContextRef.current!.createOscillator()
      const gainNode = audioContextRef.current!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current!.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startTime)
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.05, startTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    const ctx = audioContextRef.current
    const currentTime = ctx.currentTime
    
    const melody = [
      { freq: 220, duration: 0.5 },
      { freq: 246.94, duration: 0.5 },
      { freq: 261.63, duration: 0.5 },
      { freq: 293.66, duration: 0.5 },
      { freq: 329.63, duration: 1 },
      { freq: 293.66, duration: 0.5 },
      { freq: 261.63, duration: 0.5 },
      { freq: 246.94, duration: 1 },
    ]

    let noteTime = currentTime
    melody.forEach(note => {
      playNote(note.freq, noteTime, note.duration)
      noteTime += note.duration
    })

    setTimeout(() => {
      backgroundMusicRef.current = null
      if (playBackgroundMusic) {
        setTimeout(() => playBackgroundMusicLoop(), 8000)
      }
    }, 8000)
  }

  useEffect(() => {
    if (playBackgroundMusic && audioContextRef.current) {
      const startMusic = () => {
        playBackgroundMusicLoop()
      }
      startMusic()
      const interval = setInterval(startMusic, 8000)
      return () => clearInterval(interval)
    }
  }, [playBackgroundMusic])

  useEffect(() => {
    if (playButtonClick) {
      createOscillator(800, 0.1, 'square')
    }
  }, [playButtonClick])

  useEffect(() => {
    if (playError) {
      createOscillator(150, 0.3, 'sawtooth')
      setTimeout(() => createOscillator(100, 0.3, 'sawtooth'), 100)
    }
  }, [playError])

  useEffect(() => {
    if (playSuccess) {
      const notes = [523.25, 659.25, 783.99, 1046.50]
      notes.forEach((freq, index) => {
        setTimeout(() => createOscillator(freq, 0.3, 'sine'), index * 100)
      })
    }
  }, [playSuccess])

  useEffect(() => {
    if (playExplosion) {
      createOscillator(50, 1, 'sawtooth')
      setTimeout(() => createOscillator(30, 1.5, 'square'), 200)
      setTimeout(() => createOscillator(20, 2, 'sawtooth'), 400)
    }
  }, [playExplosion])

  useEffect(() => {
    if (playAlarm) {
      const playAlarmBeep = () => {
        createOscillator(1000, 0.2, 'square')
        setTimeout(() => createOscillator(800, 0.2, 'square'), 300)
      }
      playAlarmBeep()
      const interval = setInterval(playAlarmBeep, 1000)
      return () => clearInterval(interval)
    }
  }, [playAlarm])

  return null
}
