import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const eventState = await prisma.eventState.findFirst({
      orderBy: { id: 'asc' }
    })

    if (!eventState) {
      const newState = await prisma.eventState.create({
        data: {
          durationMinutes: 30.0,
          isStarted: false,
          isExploded: false
        }
      })
      return NextResponse.json(newState)
    }

    return NextResponse.json(eventState)
  } catch (error) {
    console.error('Error fetching timer state:', error)
    return NextResponse.json({ error: 'Failed to fetch timer state' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, durationMinutes } = await request.json()

    let eventState = await prisma.eventState.findFirst({
      orderBy: { id: 'asc' }
    })

    if (!eventState) {
      eventState = await prisma.eventState.create({
        data: {
          durationMinutes: 30.0,
          isStarted: false,
          isExploded: false
        }
      })
    }

    if (action === 'start') {
      if (eventState.isStarted) {
        return NextResponse.json({ error: 'Timer already started' }, { status: 400 })
      }

      const updatedState = await prisma.eventState.update({
        where: { id: eventState.id },
        data: {
          isStarted: true,
          startTime: new Date(),
          isExploded: false
        }
      })

      return NextResponse.json(updatedState)
    }

    if (action === 'update-duration') {
      if (eventState.isStarted) {
        return NextResponse.json({ error: 'Cannot update duration after timer started' }, { status: 400 })
      }

      const updatedState = await prisma.eventState.update({
        where: { id: eventState.id },
        data: {
          durationMinutes: durationMinutes || 30.0
        }
      })

      return NextResponse.json(updatedState)
    }

    if (action === 'check-explosion') {
      if (!eventState.isStarted || eventState.isExploded) {
        return NextResponse.json(eventState)
      }

      const now = new Date()
      const elapsed = (now.getTime() - eventState.startTime!.getTime()) / 1000
      const totalSeconds = eventState.durationMinutes * 60

      if (elapsed >= totalSeconds) {
        const explodedState = await prisma.eventState.update({
          where: { id: eventState.id },
          data: { isExploded: true }
        })
        return NextResponse.json(explodedState)
      }

      return NextResponse.json(eventState)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating timer state:', error)
    return NextResponse.json({ error: 'Failed to update timer state' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await prisma.defusalRecord.deleteMany({})
    
    let eventState = await prisma.eventState.findFirst({
      orderBy: { id: 'asc' }
    })

    if (!eventState) {
      eventState = await prisma.eventState.create({
        data: {
          durationMinutes: 30.0,
          isStarted: false,
          isExploded: false
        }
      })
    } else {
      eventState = await prisma.eventState.update({
        where: { id: eventState.id },
        data: {
          isStarted: false,
          startTime: null,
          isExploded: false
        }
      })
    }

    return NextResponse.json({ message: 'System reset successfully', eventState })
  } catch (error) {
    console.error('Error resetting system:', error)
    return NextResponse.json({ error: 'Failed to reset system' }, { status: 500 })
  }
}
