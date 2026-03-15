'use client'

import { useState, useEffect } from 'react'

interface EventState {
  id: number
  durationMinutes: number
  startTime: string | null
  isStarted: boolean
  isExploded: boolean
}

interface TimerDisplayProps {
  className?: string
}

export default function TimerDisplay({ className = '' }: TimerDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('00:00.0000')
  const [isExploded, setIsExploded] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    const fetchTimerState = async () => {
      try {
        const response = await fetch('/api/timer')
        if (response.ok) {
          const state: EventState = await response.json()
          setIsExploded(state.isExploded)
          setIsStarted(state.isStarted)

          if (state.isStarted && state.startTime && !state.isExploded) {
            const now = new Date().getTime()
            const start = new Date(state.startTime).getTime()
            const elapsed = (now - start) / 1000
            const totalSeconds = state.durationMinutes * 60
            const remaining = Math.max(0, totalSeconds - elapsed)

            const minutes = Math.floor(remaining / 60)
            const seconds = Math.floor(remaining % 60)
            
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            setTimeRemaining(formattedTime)

            if (remaining <= 0 && !state.isExploded) {
              await fetch('/api/timer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check-explosion' })
              })
              setIsExploded(true)
            }
          } else if (!state.isStarted) {
            setTimeRemaining('SYSTEM ARMED')
          } else if (state.isExploded) {
            setTimeRemaining('EXPLODED')
          } else if (state.isStarted && state.startTime === null) {
            // Timer was reset but isStarted flag is still true
            setTimeRemaining('SYSTEM ARMED')
          }
        }
      } catch (error) {
        console.error('Error fetching timer state:', error)
      }
    }

    fetchTimerState()
    const interval = setInterval(fetchTimerState, 500)

    return () => clearInterval(interval)
  }, [])

  const isLowTime = isStarted && !isExploded && timeRemaining !== 'SYSTEM ARMED' && timeRemaining !== 'EXPLODED' && 
    (() => {
      const [minutes, seconds] = timeRemaining.split(':')
      const totalMinutes = parseInt(minutes) + parseFloat(seconds) / 60
      return totalMinutes < 5
    })()

  return (
    <div className={`text-center ${className}`}>
      <div className={`font-mono text-4xl md:text-6xl font-bold tracking-wider ${
        isExploded ? 'text-red-600 animate-pulse' : 
        isLowTime ? 'text-red-500 animate-pulse' : 
        'text-green-400'
      }`}>
        {timeRemaining}
      </div>
      {!isStarted && !isExploded && (
        <div className="text-green-400 font-mono text-sm mt-2 animate-pulse">
          AWAITING ACTIVATION...
        </div>
      )}
      {isStarted && !isExploded && (
        <div className="text-yellow-400 font-mono text-sm mt-2">
          BOMB ACTIVE
        </div>
      )}
      {isExploded && (
        <div className="text-red-600 font-mono text-sm mt-2 animate-pulse">
          SYSTEM COMPROMISED
        </div>
      )}
    </div>
  )
}
