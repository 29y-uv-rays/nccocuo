'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ExplosionPage() {
  const [showExplosion, setShowExplosion] = useState(false)
  const [screenShake, setScreenShake] = useState(true)

  useEffect(() => {
    setShowExplosion(true)
    
    const shakeTimer = setTimeout(() => {
      setScreenShake(false)
    }, 3000)

    const blinkTimer = setInterval(() => {
      const overlay = document.getElementById('red-overlay')
      if (overlay) {
        overlay.style.opacity = overlay.style.opacity === '0' ? '0.8' : '0'
      }
    }, 500)

    return () => {
      clearTimeout(shakeTimer)
      clearInterval(blinkTimer)
    }
  }, [])

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden ${screenShake ? 'animate-pulse' : ''}`}>
      <div 
        id="red-overlay"
        className="absolute inset-0 bg-red-600 opacity-80 pointer-events-none transition-opacity duration-100"
        style={{ animation: 'flash 0.5s infinite' }}
      />
      
      {showExplosion && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-90 animate-ping" 
                 style={{ width: '800px', height: '800px', transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }} />
            <div className="absolute inset-0 bg-orange-500 rounded-full opacity-70 animate-ping" 
                 style={{ width: '600px', height: '600px', transform: 'translate(-50%, -50%)', left: '50%', top: '50%', animationDelay: '0.1s' }} />
            <div className="absolute inset-0 bg-red-600 rounded-full opacity-50 animate-ping" 
                 style={{ width: '400px', height: '400px', transform: 'translate(-50%, -50%)', left: '50%', top: '50%', animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold font-mono mb-8 text-red-600 animate-pulse">
            💥 EXPLOSION 💥
          </h1>
          
          <div className="text-2xl md:text-4xl font-mono mb-4 text-red-500 animate-pulse">
            BOMB HAS DETONATED
          </div>
          
          <div className="text-xl md:text-2xl font-mono mb-8 text-red-400">
            SYSTEM COMPROMISED
          </div>

          <div className="border-4 border-red-600 p-8 bg-red-950 mb-8">
            <div className="font-mono text-red-300 text-lg mb-4">
              MISSION FAILED
            </div>
            <div className="font-mono text-red-400">
              ALL TEAMS ELIMINATED
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/leaderboard"
              className="block w-full md:w-auto mx-auto bg-red-900 hover:bg-red-800 text-red-400 font-mono px-8 py-4 border-4 border-red-600 transition-colors"
            >
              VIEW FINAL LEADERBOARD
            </Link>
            
            <div className="font-mono text-red-600 text-sm">
              ALL OTHER SYSTEMS OFFLINE
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t-4 border-red-900 p-4 bg-red-950">
        <div className="text-center font-mono text-xs text-red-600 animate-pulse">
          ⚠️ CRITICAL SYSTEM FAILURE ⚠️ | NCC DIGITAL DEFUSAL SYSTEM v1.0 | STATUS: COMPROMISED
        </div>
      </div>

      <style jsx>{`
        @keyframes flash {
          0%, 50% { opacity: 0.8; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        ${screenShake ? `
          body {
            animation: shake 0.5s infinite;
          }
        ` : ''}
      `}</style>
    </div>
  )
}
