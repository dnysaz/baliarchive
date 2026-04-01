
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await (prisma as any).siteSettings.findFirst({ where: { id: 1 } });

  if (settings) {
    console.log('--- SITE SETTINGS CONTENT ---');
    console.log(`ABOUT CONTENT snippet: ${settings.aboutContent.substring(0, 100)}...`);
    console.log(`TERMS CONTENT snippet: ${settings.termsContent.substring(0, 100)}...`);
    console.log(`CONTACT CONTENT snippet: ${settings.contactContent.substring(0, 100)}...`);
  } else {
    console.log('No settings found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
