const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSEO() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Bali Archive — Discover Local Gems',
      description: 'Bali as the locals know it.',
      keywords: 'bali, travel, archive',
      ogImage: '/og-default.jpg',
      favicon: '/favicon.ico'
    }
  });

  console.log('Successfully seeded SEO settings:', settings);
  await prisma.$disconnect();
}

seedSEO().catch(e => {
  console.error(e);
  process.exit(1);
});
