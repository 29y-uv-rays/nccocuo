'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TimerDisplay from '@/components/TimerDisplay'

interface Group {
  id: string
  name: string
  password: string
  createdAt: string
  defusalRecords: any[]
}

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isExploded, setIsExploded] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsResponse, timerResponse] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/timer')
        ])

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          const foundGroup = groupsData.find((g: Group) => g.id === groupId)
          setGroup(foundGroup || null)
        }

        if (timerResponse.ok) {
          const timerData = await timerResponse.json()
          setIsExploded(timerData.isExploded)
          setIsStarted(timerData.isStarted)

          if (timerData.isExploded) {
            router.push('/explosion')
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 2000)

    return () => clearInterval(interval)
  }, [groupId, router])

  useEffect(() => {
    if (isExploded) {
      router.push('/explosion')
    }
  }, [isExploded, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('PASSWORD REQUIRED')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/defuse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          password: password.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push(`/success?group=${encodeURIComponent(group?.name || '')}&time=${data.timeTaken}&rank=${data.rank}`)
      } else {
        setError(data.error || 'DEFUSAL FAILED')
        if (data.error === 'Incorrect password') {
          setPassword('')
        }
      }
    } catch (error) {
      console.error('Error submitting defusal:', error)
      setError('SYSTEM ERROR')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="font-mono text-xl animate-pulse">INITIALIZING SYSTEM...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex flex-col items-center justify-center p-4">
        <div className="font-mono text-2xl mb-8">GROUP NOT FOUND</div>
        <Link 
          href="/"
          className="font-mono text-green-400 hover:text-green-300 underline"
        >
          RETURN TO HOME
        </Link>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-black text-yellow-400 flex flex-col items-center justify-center p-4">
        <div className="font-mono text-2xl mb-4 text-center">TIMER NOT ACTIVATED</div>
        <div className="font-mono text-lg mb-8 text-center">AWAITING ADMIN ACTIVATION</div>
        <Link 
          href="/"
          className="font-mono text-green-400 hover:text-green-300 underline"
        >
          RETURN TO HOME
        </Link>
      </div>
    )
  }

  const isDefused = group.defusalRecords.length > 0

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <TimerDisplay className="mb-8" />
            
            <h1 className="text-3xl md:text-4xl font-bold font-mono mb-2 text-green-400">
              {group.name.toUpperCase()}
            </h1>
            
            {isDefused ? (
              <div className="text-green-300 font-mono">
                BOMB DEFUSED - {group.defusalRecords[0].timeTakenSeconds.toFixed(4)}s
              </div>
            ) : (
              <div className="text-yellow-400 font-mono">
                BOMB ACTIVE - ENTER PASSWORD
              </div>
            )}
          </div>

          {!isDefused && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block font-mono text-sm mb-2 text-green-300">
                  PASSWORD:
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-black border-2 font-mono text-green-400 placeholder-green-700 focus:outline-none focus:border-green-300 ${
                    error ? 'border-red-500 animate-pulse' : 'border-green-400'
                  }`}
                  placeholder="ENTER PASSWORD"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-500 font-mono text-sm text-center animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className="w-full bg-green-900 hover:bg-green-800 disabled:bg-green-950 disabled:text-green-700 text-green-400 font-mono px-6 py-3 border-2 border-green-400 disabled:border-green-800 transition-colors"
              >
                {isSubmitting ? 'PROCESSING...' : 'DEFUSE BOMB'}
              </button>
            </form>
          )}

          {isDefused && (
            <div className="text-center">
              <div className="mb-6 p-4 border-2 border-green-600 bg-green-950">
                <div className="font-mono text-green-300 mb-2">DEFUSAL COMPLETE</div>
                <div className="font-mono text-2xl text-green-400">
                  {group.defusalRecords[0].timeTakenSeconds.toFixed(4)}s
                </div>
              </div>
              
              <Link 
                href="/leaderboard"
                className="inline-block font-mono text-green-400 hover:text-green-300 underline mb-4"
              >
                VIEW LEADERBOARD
              </Link>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="font-mono text-green-600 hover:text-green-500 underline text-sm"
            >
              RETURN TO HOME
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-green-900 p-4">
        <div className="text-center font-mono text-xs text-green-600">
          NCC DIGITAL DEFUSAL SYSTEM v1.0 | GROUP: {group.name.toUpperCase()}
        </div>
      </div>
    </div>
  )
}
