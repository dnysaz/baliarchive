import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const dataPath = path.join(__dirname, '../.legacy-backup/data.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  console.log('Start seeding...')

  for (const item of data) {
    const { id, images, ...rest } = item
    const post = await prisma.post.create({
      data: {
        ...rest,
        images: {
          create: images.map((url: string) => ({ url }))
        }
      }
    })
    console.log(`Created post with id: ${post.id}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
