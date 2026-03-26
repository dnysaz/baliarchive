import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Clearing database (except User table)...');

  // Delete in order to respect foreign key constraints
  await (prisma as any).image.deleteMany({});
  console.log('- Images cleared');

  await (prisma as any).post.deleteMany({});
  console.log('- Posts cleared');

  await (prisma as any).location.deleteMany({});
  console.log('- Locations cleared');

  await (prisma as any).hashtag.deleteMany({});
  console.log('- Hashtags cleared');

  console.log('✅ Database cleared successfully! User accounts preserved.');
}

main()
  .catch((e) => {
    console.error('❌ Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
