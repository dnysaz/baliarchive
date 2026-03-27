import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allPosts = await prisma.post.findMany();
  console.log('Total posts:', allPosts.length);
  console.log('Drafts:', allPosts.filter(p => p.isDraft).length);
  console.log('Live:', allPosts.filter(p => !p.isDraft).length);
  console.log('Sample posts:', allPosts.slice(0, 2).map(p => ({ id: p.id, title: p.title, isDraft: p.isDraft })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
