'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TimerDisplay from '@/components/TimerDisplay'

interface Group {
  id: string
  name: string
  password: string
  createdAt: string
  defusalRecords?: Array<{
    id: string
    groupId: string
    timeTakenSeconds: number
    defusedAt: string
    createdAt: string
  }>
}

interface EventState {
  id: number
  durationMinutes: number
  startTime: string | null
  isStarted: boolean
  isExploded: boolean
}

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [eventState, setEventState] = useState<EventState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupPassword, setNewGroupPassword] = useState('')
  const [duration, setDuration] = useState('30')
  const [message, setMessage] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' })
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
      }
    }
    
    checkAuth()
  }, [])

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
          setEventState(timerData)
          setDuration(timerData.durationMinutes.toString())
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

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newGroupName.trim() || !newGroupPassword.trim()) {
      setMessage('NAME AND PASSWORD REQUIRED')
      return
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          password: newGroupPassword.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setGroups([...groups, data])
        setNewGroupName('')
        setNewGroupPassword('')
        setMessage('GROUP ADDED SUCCESSFULLY')
      } else {
        setMessage(data.error || 'FAILED TO ADD GROUP')
      }
    } catch (error) {
      console.error('Error adding group:', error)
      setMessage('SYSTEM ERROR')
    }

    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('DELETE THIS GROUP?')) return

    try {
      const response = await fetch('/api/groups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: groupId })
      })

      if (response.ok) {
        setGroups(groups.filter(g => g.id !== groupId))
        setMessage('GROUP DELETED')
      } else {
        const data = await response.json()
        setMessage(data.error || 'FAILED TO DELETE GROUP')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      setMessage('SYSTEM ERROR')
    }

    setTimeout(() => setMessage(''), 3000)
  }

  const handleUpdateDuration = async () => {
    const durationNum = parseInt(duration)
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 999) {
      setMessage('INVALID DURATION (1-999 MINUTES)')
      return
    }

    try {
      const response = await fetch('/api/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-duration',
          durationMinutes: durationNum
        })
      })

      const data = await response.json()

      if (response.ok) {
        setEventState(data)
        setMessage('DURATION UPDATED')
      } else {
        setMessage(data.error || 'FAILED TO UPDATE DURATION')
      }
    } catch (error) {
      console.error('Error updating duration:', error)
      setMessage('SYSTEM ERROR')
    }

    setTimeout(() => setMessage(''), 3000)
  }

  const handleStartTimer = async () => {
    if (!confirm('START THE TIMER? THIS CANNOT BE UNDONE.')) return

    setIsStarting(true)
    try {
      const response = await fetch('/api/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' })
      })

      const data = await response.json()

      if (response.ok) {
        setEventState(data)
        setMessage('TIMER STARTED')
      } else {
        setMessage(data.error || 'FAILED TO START TIMER')
      }
    } catch (error) {
      console.error('Error starting timer:', error)
      setMessage('SYSTEM ERROR')
    } finally {
      setIsStarting(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleResetTimer = async () => {
    if (!confirm('RESET TIMER TO 0? THIS WILL NOT AFFECT DEFUSAL RECORDS OR LEADERBOARD.')) return

    setIsResetting(true)
    try {
      const response = await fetch('/api/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset-timer' })
      })

      const data = await response.json()

      if (response.ok) {
        setEventState(data)
        setMessage('TIMER RESET')
      } else {
        setMessage(data.error || 'FAILED TO RESET TIMER')
      }
    } catch (error) {
      console.error('Error resetting timer:', error)
      setMessage('SYSTEM ERROR')
    } finally {
      setIsResetting(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleResetSystem = async () => {
    if (!confirm('RESET THE ENTIRE SYSTEM? THIS WILL CLEAR ALL DEFUSAL RECORDS.')) return

    setIsResetting(true)
    try {
      const response = await fetch('/api/timer', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setEventState(data.eventState)
        setGroups(groups.map(g => ({ ...g, defusalRecords: [] })))
        setMessage('SYSTEM RESET')
      } else {
        setMessage(data.error || 'FAILED TO RESET SYSTEM')
      }
    } catch (error) {
      console.error('Error resetting system:', error)
      setMessage('SYSTEM ERROR')
    } finally {
      setIsResetting(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          password: adminPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        setPasswordError('')
      } else {
        setPasswordError(data.error || 'INVALID PASSWORD')
        setAdminPassword('')
      }
    } catch (error) {
      console.error('Error logging in:', error)
      setPasswordError('SYSTEM ERROR')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="w-full max-w-md p-8 border-2 border-green-400">
          <h1 className="text-2xl font-bold font-mono mb-6 text-center text-green-300">
            ADMIN ACCESS REQUIRED
          </h1>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-sm mb-2 text-green-300">
                ENTER PASSWORD:
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 bg-black border-2 font-mono text-green-400 border-green-400 focus:outline-none focus:border-green-300"
                placeholder="••••••••"
                autoFocus
              />
            </div>

            {passwordError && (
              <div className="text-center font-mono text-red-400 border-2 border-red-400 p-2 bg-red-950">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-900 hover:bg-green-800 text-green-400 font-mono px-4 py-2 border-2 border-green-400 transition-colors"
            >
              AUTHENTICATE
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="font-mono text-green-400 hover:text-green-300 underline text-sm"
            >
              RETURN TO HOME
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="font-mono text-xl animate-pulse">LOADING ADMIN PANEL...</div>
      </div>
    )
  }

  const isLocked = eventState?.isStarted || false

  return (
    <div className="min-h-screen bg-black text-green-400 flex flex-col">
      <div className="flex-1 p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-mono mb-4 text-green-400 tracking-wider">
              ADMIN CONTROL PANEL
            </h1>
            <TimerDisplay className="mb-4" />
          </div>

          {message && (
            <div className={`text-center font-mono mb-6 p-3 border-2 ${
              message.includes('SUCCESS') || message.includes('ADDED') || message.includes('DELETED') || message.includes('UPDATED') || message.includes('STARTED') || message.includes('RESET')
                ? 'text-green-300 border-green-400 bg-green-950'
                : 'text-red-400 border-red-400 bg-red-950'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="border-2 border-green-400 p-6">
                <h2 className="text-xl font-bold font-mono mb-4 text-green-300">TIMER CONTROL</h2>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={isLocked}
                      className="w-full px-3 py-2 bg-black border-2 font-mono text-green-400 border-green-400 focus:outline-none focus:border-green-300 disabled:border-green-800 disabled:text-green-700"
                      step="1"
                      min="1"
                      max="999"
                    />
                  </div>

                  <button
                    onClick={handleUpdateDuration}
                    disabled={isLocked}
                    className="w-full bg-green-900 hover:bg-green-800 disabled:bg-green-950 disabled:text-green-700 text-green-400 font-mono px-4 py-2 border-2 border-green-400 disabled:border-green-800 transition-colors"
                  >
                    UPDATE DURATION
                  </button>

                  {!eventState?.isStarted && (
                    <button
                      onClick={handleStartTimer}
                      disabled={isStarting}
                      className="w-full bg-red-900 hover:bg-red-800 disabled:bg-red-950 disabled:text-red-700 text-red-400 font-mono px-4 py-2 border-2 border-red-400 disabled:border-red-800 transition-colors"
                    >
                      {isStarting ? 'STARTING...' : 'START TIMER'}
                    </button>
                  )}

                  {eventState?.isStarted && (
                    <>
                      <button
                        onClick={handleResetTimer}
                        disabled={isResetting}
                        className="w-full bg-yellow-900 hover:bg-yellow-800 disabled:bg-yellow-950 disabled:text-yellow-700 text-yellow-400 font-mono px-4 py-2 border-2 border-yellow-400 disabled:border-yellow-800 transition-colors mb-2"
                      >
                        {isResetting ? 'RESETTING TIMER...' : 'RESET TIMER'}
                      </button>
                      <div className="text-center font-mono text-yellow-400 p-2 border border-yellow-400">
                        TIMER ACTIVE - CONTROLS LOCKED (reset only resets time)
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-2 border-green-400 p-6">
                <h2 className="text-xl font-bold font-mono mb-4 text-green-300">SYSTEM CONTROL</h2>
                
                <button
                  onClick={handleResetSystem}
                  disabled={isResetting}
                  className="w-full bg-red-900 hover:bg-red-800 disabled:bg-red-950 disabled:text-red-700 text-red-400 font-mono px-4 py-2 border-2 border-red-400 disabled:border-red-800 transition-colors"
                >
                  {isResetting ? 'RESETTING...' : 'RESET SYSTEM'}
                </button>
                
                <div className="mt-4 text-xs font-mono text-green-600">
                  RESET CLEARS ALL DEFUSAL RECORDS AND TIMER STATE
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-green-400 p-6">
                <h2 className="text-xl font-bold font-mono mb-4 text-green-300">ADD GROUP</h2>
                
                <form onSubmit={handleAddGroup} className="space-y-4">
                  <div>
                    <label className="block font-mono text-sm mb-2 text-green-300">
                      GROUP NAME:
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      disabled={isLocked}
                      className="w-full px-3 py-2 bg-black border-2 font-mono text-green-400 border-green-400 focus:outline-none focus:border-green-300 disabled:border-green-800 disabled:text-green-700"
                      placeholder="ENTER GROUP NAME"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-sm mb-2 text-green-300">
                      PASSWORD:
                    </label>
                    <input
                      type="text"
                      value={newGroupPassword}
                      onChange={(e) => setNewGroupPassword(e.target.value)}
                      disabled={isLocked}
                      className="w-full px-3 py-2 bg-black border-2 font-mono text-green-400 border-green-400 focus:outline-none focus:border-green-300 disabled:border-green-800 disabled:text-green-700"
                      placeholder="ENTER PASSWORD"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLocked}
                    className="w-full bg-green-900 hover:bg-green-800 disabled:bg-green-950 disabled:text-green-700 text-green-400 font-mono px-4 py-2 border-2 border-green-400 disabled:border-green-800 transition-colors"
                  >
                    ADD GROUP
                  </button>
                </form>

                {isLocked && (
                  <div className="mt-4 text-xs font-mono text-yellow-600">
                    GROUP EDITING LOCKED DURING ACTIVE TIMER
                  </div>
                )}
              </div>

              <div className="border-2 border-green-400 p-6">
                <h2 className="text-xl font-bold font-mono mb-4 text-green-300">
                  REGISTERED GROUPS ({groups.length})
                </h2>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {groups.length === 0 ? (
                    <div className="font-mono text-green-600 text-center py-4">
                      NO GROUPS REGISTERED
                    </div>
                  ) : (
                    groups.map((group) => (
                      <div key={group.id} className="flex items-center justify-between p-2 border border-green-800">
                        <div className="flex-1">
                          <div className="font-mono text-green-400">
                            {group.name.toUpperCase()}
                          </div>
                          <div className="font-mono text-xs text-green-600">
                            {group.defusalRecords && group.defusalRecords.length > 0 ? `DEFUSED: ${group.defusalRecords[0].timeTakenSeconds.toFixed(4)}s` : 'ACTIVE'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={isLocked}
                          className="ml-2 px-3 py-1 bg-red-900 hover:bg-red-800 disabled:bg-red-950 disabled:text-red-700 text-red-400 font-mono text-xs border border-red-400 disabled:border-red-800 transition-colors"
                        >
                          DELETE
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="font-mono text-green-400 hover:text-green-300 underline"
            >
              RETURN TO HOME
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-green-900 p-4">
        <div className="text-center font-mono text-xs text-green-600">
          NCC DIGITAL DEFUSAL SYSTEM v1.0 | ADMIN PANEL | STATUS: {eventState?.isExploded ? 'COMPROMISED' : eventState?.isStarted ? 'ACTIVE' : 'ARMED'}
        </div>
      </div>
    </div>
  )
}
