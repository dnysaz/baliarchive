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
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
    },
  });

  // 2. Create default regencies
  const regencies = [
    { name: 'Badung', slug: 'badung' },
    { name: 'Gianyar', slug: 'gianyar' },
    { name: 'Denpasar', slug: 'denpasar' },
    { name: 'Tabanan', slug: 'tabanan' },
    { name: 'Karangasem', slug: 'karangasem' },
    { name: 'Buleleng', slug: 'buleleng' },
    { name: 'Klungkung', slug: 'klungkung' },
    { name: 'Bangli', slug: 'bangli' },
    { name: 'Jembrana', slug: 'jembrana' },
    { name: 'Ubud', slug: 'ubud' },
  ];

  for (const regency of regencies) {
    await prisma.regency.upsert({
      where: { slug: regency.slug },
      update: {},
      create: {
        name: regency.name,
        slug: regency.slug,
      },
    });
  }

  // 3. Create default site settings
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      aboutTitle: 'Welcome to Bali Archive',
      aboutContent: 'Bali Archive is a community-driven platform dedicated to sharing the hidden gems, temples, and destinations across Bali.',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
