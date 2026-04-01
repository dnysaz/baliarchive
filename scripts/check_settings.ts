
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await (prisma as any).siteSettings.findMany();

  console.log('--- ALL SITE SETTINGS ---');
  settings.forEach((s: any) => {
    console.log(`ID: ${s.id}`);
    console.log(`About Title: "${s.aboutTitle}"`);
    console.log(`Terms Title: "${s.termsTitle}"`);
    console.log(`Contact Title: "${s.contactTitle}"`);
    console.log('-------------------------');
  });

  if (settings.length === 0) {
    console.log('WARNING: No site settings found in database.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
