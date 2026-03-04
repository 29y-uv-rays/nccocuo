'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TimerDisplay from '@/components/TimerDisplay'

interface LeaderboardEntry {
  rank: number
  groupName: string
  timeTaken: string
  defusedAt: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExploded, setIsExploded] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardResponse, timerResponse] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/timer')
        ])

        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json()
          setLeaderboard(leaderboardData)
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
    const interval = setInterval(fetchData, 2000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="font-mono text-xl animate-pulse">LOADING LEADERBOARD...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <TimerDisplay className="mb-8" />
            
            <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 text-green-400 tracking-wider">
              LEADERBOARD
            </h1>
            <div className="text-lg font-mono text-green-300">
              LIVE RANKINGS
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="font-mono text-xl text-green-400 mb-4">
                NO DEFUSALS YET
              </div>
              <div className="font-mono text-green-600">
                BE THE FIRST TO DEFUSE THE BOMB!
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-green-400">
                <thead>
                  <tr className="border-b-2 border-green-400 bg-green-950">
                    <th className="px-4 py-3 text-left font-mono text-green-300">RANK</th>
                    <th className="px-4 py-3 text-left font-mono text-green-300">GROUP</th>
                    <th className="px-4 py-3 text-right font-mono text-green-300">TIME</th>
                    <th className="px-4 py-3 text-right font-mono text-green-300">DEFUSED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={`${entry.rank}-${entry.groupName}`}
                      className={`border-b border-green-900 ${
                        index === 0 ? 'bg-green-950' : 
                        index === 1 ? 'bg-green-950 bg-opacity-75' : 
                        index === 2 ? 'bg-green-950 bg-opacity-50' : 
                        ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono">
                        <span className={`${
                          index === 0 ? 'text-yellow-400 font-bold' : 
                          index === 1 ? 'text-gray-400 font-bold' : 
                          index === 2 ? 'text-orange-600 font-bold' : 
                          'text-green-400'
                        }`}>
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-green-400">
                        {entry.groupName.toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-400 font-mono">
                        {entry.timeTaken}s
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-600 text-sm">
                        {new Date(entry.defusedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 flex justify-center space-x-8">
            <Link 
              href="/"
              className="font-mono text-green-400 hover:text-green-300 underline"
            >
              HOME
            </Link>
            {isStarted && !isExploded && (
              <Link 
                href="/admin"
                className="font-mono text-yellow-400 hover:text-yellow-300 underline"
              >
                ADMIN
              </Link>
            )}
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-8 text-center">
              <div className="font-mono text-green-600 text-sm">
                TOTAL TEAMS: {leaderboard.length}
              </div>
              <div className="font-mono text-green-600 text-sm">
                FASTEST TIME: {leaderboard[0].timeTaken}s
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-green-900 p-4">
        <div className="text-center font-mono text-xs text-green-600">
          NCC DIGITAL DEFUSAL SYSTEM v1.0 | AUTO-REFRESH EVERY 2s
        </div>
      </div>
    </div>
  )
}
