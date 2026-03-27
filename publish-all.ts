import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.post.updateMany({
    where: { isDraft: true },
    data: { isDraft: false }
  });
  console.log('Published posts:', result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
