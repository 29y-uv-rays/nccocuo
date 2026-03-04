'use client'

import { useState } from 'react'

interface SoundButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  soundType?: 'click' | 'error' | 'success'
}

export default function SoundButton({ 
  children, 
  onClick, 
  className = '', 
  soundType = 'click' 
}: SoundButtonProps) {
  const [playSound, setPlaySound] = useState(false)

  const handleClick = () => {
    setPlaySound(true)
    setTimeout(() => setPlaySound(false), 100)
    if (onClick) onClick()
  }

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      {playSound && (
        <audio autoPlay className="hidden">
          <source 
            src={soundType === 'click' ? '/sounds/click.mp3' : 
                  soundType === 'error' ? '/sounds/error.mp3' : 
                  '/sounds/success.mp3'} 
            type="audio/mpeg" 
          />
        </audio>
      )}
    </>
  )
}
