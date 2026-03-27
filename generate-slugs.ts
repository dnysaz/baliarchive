const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({ where: { slug: null } });
  let count = 0;
  for (const p of posts) {
    let slug = p.title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check for collisions
    let existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${p.id}`;
    }

    await prisma.post.update({
      where: { id: p.id },
      data: { slug }
    });
    count++;
  }
  console.log(`Updated ${count} posts with new slugs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
