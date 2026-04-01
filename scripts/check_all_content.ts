
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await (prisma as any).siteSettings.findFirst({ where: { id: 1 } });

  if (settings) {
    console.log('--- FULL CONTACT CONTENT ---');
    console.log(settings.contactContent);
    console.log('----------------------------');
  } else {
    console.log('No settings found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
