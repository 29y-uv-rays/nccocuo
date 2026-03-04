'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TimerDisplay from '@/components/TimerDisplay'

interface Group {
  id: string
  name: string
  createdAt: string
  defusalRecords?: Array<{
    id: string
    groupId: string
    timeTakenSeconds: number
    defusedAt: string
    createdAt: string
  }>
}

export default function HomePage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isExploded, setIsExploded] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsResponse, timerResponse] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/timer')
        ])

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setGroups(groupsData)
        }

        if (timerResponse.ok) {
          const timerData = await timerResponse.json()
          setIsExploded(timerData.isExploded)
          setIsStarted(timerData.isStarted)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isExploded) {
      window.location.href = '/explosion'
    }
  }, [isExploded])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="font-mono text-xl animate-pulse">INITIALIZING SYSTEM...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold font-mono mb-4 text-green-400 tracking-wider">
              NCC DIGITAL BOMB DEFUSAL
            </h1>
            <div className="text-xl font-mono text-green-300 mb-8">
              URBAN OPERATIONS CONTROL SYSTEM
            </div>
            
            <TimerDisplay className="mb-12" />
          </div>

          {!isStarted && (
            <div className="text-center mb-8">
              <div className="inline-block bg-green-900 text-green-700 font-mono px-6 py-3 border border-green-800 opacity-50 cursor-not-allowed">
                ADMIN CONTROL PANEL
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/group/${group.id}`}
                className={`block p-6 border-2 font-mono text-center transition-all ${
                  group.defusalRecords && group.defusalRecords.length > 0
                    ? 'border-green-600 bg-green-950 text-green-300'
                    : 'border-green-400 hover:border-green-300 hover:bg-green-950'
                }`}
              >
                <div className="text-lg font-bold mb-2">
                  {group.name.toUpperCase()}
                </div>
                {group.defusalRecords && group.defusalRecords.length > 0 ? (
                  <div className="text-sm text-green-400">
                    DEFUSED: {group.defusalRecords[0].timeTakenSeconds.toFixed(4)}s
                  </div>
                ) : (
                  <div className="text-sm text-green-400">
                    ACTIVE
                  </div>
                )}
              </Link>
            ))}
          </div>

          {groups.length === 0 && !isStarted && (
            <div className="text-center text-green-400 font-mono">
              <div className="mb-4">NO GROUPS REGISTERED</div>
            </div>
          )}

          <div className="mt-12 flex justify-center space-x-8">
            <Link 
              href="/leaderboard"
              className="font-mono text-green-400 hover:text-green-300 underline"
            >
              LEADERBOARD
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-green-900 p-4">
        <div className="text-center font-mono text-xs text-green-600">
          NCC DIGITAL DEFUSAL SYSTEM v1.0 | STATUS: {isExploded ? 'COMPROMISED' : isStarted ? 'ACTIVE' : 'ARMED'}
        </div>
      </div>
    </div>
  )
}
