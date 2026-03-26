import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // 1. Create a default admin user
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminUser = await (prisma as any).user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
    },
  });

  // 2. Create a default location
  const baliLocation = await (prisma as any).location.upsert({
    where: { name: 'Bali' },
    update: {},
    create: {
      name: 'Bali',
    },
  });

  // 3. Create a default hashtag
  const baliHashtag = await (prisma as any).hashtag.upsert({
    where: { name: 'bali' },
    update: {},
    create: {
      name: 'bali',
    },
  });

  console.log({ adminUser, baliLocation, baliHashtag });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
