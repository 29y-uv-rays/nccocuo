import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { groupId, password } = await request.json()

    if (!groupId || !password) {
      return NextResponse.json({ error: 'Group ID and password are required' }, { status: 400 })
    }

    const eventState = await prisma.eventState.findFirst({
      orderBy: { id: 'asc' }
    })

    if (!eventState?.isStarted) {
      return NextResponse.json({ error: 'Timer has not started yet' }, { status: 400 })
    }

    if (eventState.isExploded) {
      return NextResponse.json({ error: 'Bomb has already exploded' }, { status: 400 })
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const now = new Date()
    const elapsed = (now.getTime() - eventState.startTime!.getTime()) / 1000
    const timeTaken = elapsed

    const existingRecord = await prisma.defusalRecord.findFirst({
      where: { groupId },
      orderBy: { timeTakenSeconds: 'asc' }
    })

    if (existingRecord && existingRecord.timeTakenSeconds <= timeTaken) {
      return NextResponse.json({ 
        error: 'Group already has a better or equal time',
        existingTime: existingRecord.timeTakenSeconds
      }, { status: 400 })
    }

    const defusalRecord = await prisma.defusalRecord.create({
      data: {
        groupId,
        timeTakenSeconds: timeTaken,
        defusedAt: now
      }
    })

    const rank = await prisma.defusalRecord.count({
      where: {
        timeTakenSeconds: {
          lt: timeTaken
        }
      }
    })

    return NextResponse.json({
      success: true,
      defusalRecord,
      rank: rank + 1,
      timeTaken: timeTaken.toFixed(4)
    })

  } catch (error) {
    console.error('Error processing defusal:', error)
    return NextResponse.json({ error: 'Failed to process defusal' }, { status: 500 })
  }
}
