import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const leaderboard = await prisma.defusalRecord.findMany({
      include: {
        group: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { timeTakenSeconds: 'asc' },
        { defusedAt: 'asc' }
      ]
    })

    const formattedLeaderboard = leaderboard.map((record, index) => ({
      rank: index + 1,
      groupName: record.group.name,
      timeTaken: record.timeTakenSeconds.toFixed(4),
      defusedAt: record.defusedAt
    }))

    return NextResponse.json(formattedLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
