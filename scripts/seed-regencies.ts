import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const regencies = [
    { name: 'Badung', slug: 'badung' },
    { name: 'Bangli', slug: 'bangli' },
    { name: 'Buleleng', slug: 'buleleng' },
    { name: 'Denpasar', slug: 'denpasar' },
    { name: 'Gianyar', slug: 'gianyar' },
    { name: 'Jembrana', slug: 'jembrana' },
    { name: 'Karangasem', slug: 'karangasem' },
    { name: 'Klungkung', slug: 'klungkung' },
    { name: 'Tabanan', slug: 'tabanan' },
  ];

  for (const r of regencies) {
    await prisma.regency.upsert({
      where: { name: r.name },
      update: { slug: r.slug },
      create: r,
    });
  }
  console.log('Regencies seeded/updated.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
