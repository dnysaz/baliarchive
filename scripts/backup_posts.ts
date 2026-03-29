import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Backing up current posts...');
  const posts = await prisma.post.findMany({
    include: {
      images: true,
      hashtags: true,
      regency: true
    }
  });

  fs.writeFileSync('./tmp/posts_backup.json', JSON.stringify(posts, null, 2));
  console.log(`✅ Backup successful! ${posts.length} posts saved to ./tmp/posts_backup.json`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
