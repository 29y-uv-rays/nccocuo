import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Add it to .env before seeding.')
}

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // Create initial event state
  const eventState = await prisma.eventState.upsert({
    where: { id: 1 },
    update: {},
    create: {
      durationMinutes: 30.0,
      isStarted: false,
      isExploded: false,
    },
  })

  console.log('Created event state:', eventState)

  // Create sample groups
  const sampleGroups = [
    { name: 'Alpha Team', password: 'ALPHA123' },
    { name: 'Bravo Squad', password: 'BRAVO456' },
    { name: 'Charlie Unit', password: 'CHARLIE789' },
    { name: 'Delta Force', password: 'DELTA012' },
    { name: 'Echo Group', password: 'ECHO345' },
  ]

  for (const group of sampleGroups) {
    const groupId = group.name.toLowerCase().replace(/\s+/g, '-')
    
    await prisma.group.upsert({
      where: { id: groupId },
      update: {},
      create: {
        id: groupId,
        name: group.name,
        password: group.password,
      },
    })
    
    console.log(`Created group: ${group.name}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
