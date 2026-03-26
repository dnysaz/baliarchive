import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating data to new relational structure...');

  // 1. Get all posts
  const posts = await prisma.post.findMany();

  for (const post of posts) {
    // 2. Ensure location exists
    let location = await (prisma as any).location.findUnique({
      where: { name: post.kabupaten }
    });
    if (!location) {
      location = await (prisma as any).location.create({
        data: { name: post.kabupaten }
      });
    }

    // 3. Ensure hashtag exists
    let hashtag = await (prisma as any).hashtag.findUnique({
      where: { name: post.category }
    });
    if (!hashtag) {
      hashtag = await (prisma as any).hashtag.create({
        data: { name: post.category }
      });
    }

    // 4. Update post with relations
    await prisma.post.update({
      where: { id: post.id },
      data: {
        locationId: location.id,
        hashtagId: hashtag.id
      } as any
    });
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
