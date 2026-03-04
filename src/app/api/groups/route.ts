import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        defusalRecords: {
          orderBy: { timeTakenSeconds: 'asc' },
          take: 1
        }
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json()

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
    }

    const eventState = await prisma.eventState.findFirst({
      orderBy: { id: 'asc' }
    })

    if (eventState?.isStarted) {
      return NextResponse.json({ error: 'Cannot add groups after timer has started' }, { status: 400 })
    }

    const existingGroup = await prisma.group.findUnique({
      where: { id: name.toLowerCase().replace(/\s+/g, '-') }
    })

    if (existingGroup) {
      return NextResponse.json({ error: 'Group already exists' }, { status: 400 })
    }

    const groupId = name.toLowerCase().replace(/\s+/g, '-')
    
    const group = await prisma.group.create({
      data: {
        id: groupId,
        name,
        password
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    const eventState = await prisma.eventState.findFirst({
      orderBy: { id: 'asc' }
    })

    if (eventState?.isStarted) {
      return NextResponse.json({ error: 'Cannot delete groups after timer has started' }, { status: 400 })
    }

    await prisma.group.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
