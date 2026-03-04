'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import TimerDisplay from '@/components/TimerDisplay'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const groupName = searchParams.get('group') || 'UNKNOWN'
  const timeTaken = searchParams.get('time') || '0.0000'
  const rank = searchParams.get('rank') || '1'

  const [isExploded, setIsExploded] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const checkExplosion = async () => {
      try {
        const response = await fetch('/api/timer')
        if (response.ok) {
          const timerData = await response.json()
          setIsExploded(timerData.isExploded)
          
          if (timerData.isExploded) {
            window.location.href = '/explosion'
          }
        }
      } catch (error) {
        console.error('Error checking explosion state:', error)
      }
    }

    checkExplosion()
    const interval = setInterval(checkExplosion, 2000)

    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(confettiTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                <div className={`text-2xl ${['🎉', '✨', '🎊', '⭐', '💚'][Math.floor(Math.random() * 5)]}`}>
                  {['🎉', '✨', '🎊', '⭐', '💚'][Math.floor(Math.random() * 5)]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          <TimerDisplay className="mb-8" />
          
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold font-mono mb-4 text-green-400 animate-pulse">
              BOMB DEFUSED
            </h1>
            <div className="text-2xl md:text-3xl font-mono text-green-300 mb-2">
              {groupName.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="border-2 border-green-400 p-6 bg-green-950">
              <div className="font-mono text-green-300 text-sm mb-2">TIME TAKEN</div>
              <div className="font-mono text-4xl font-bold text-green-400">
                {timeTaken}s
              </div>
            </div>
            
            <div className="border-2 border-green-400 p-6 bg-green-950">
              <div className="font-mono text-green-300 text-sm mb-2">RANK</div>
              <div className="font-mono text-4xl font-bold text-green-400">
                #{rank}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/leaderboard"
              className="block w-full md:w-auto mx-auto bg-green-900 hover:bg-green-800 text-green-400 font-mono px-8 py-4 border-2 border-green-400 transition-colors"
            >
              VIEW LEADERBOARD
            </Link>
            
            <Link 
              href="/"
              className="block w-full md:w-auto mx-auto font-mono text-green-600 hover:text-green-500 underline"
            >
              RETURN TO HOME
            </Link>
          </div>

          <div className="mt-12 font-mono text-green-300 text-lg animate-pulse">
            EXCELLENT WORK, TEAM!
          </div>
        </div>
      </div>

      <div className="border-t border-green-900 p-4">
        <div className="text-center font-mono text-xs text-green-600">
          NCC DIGITAL DEFUSAL SYSTEM v1.0 | MISSION ACCOMPLISHED
        </div>
      </div>
    </div>
  )
}
