import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Repairing Hashtag Relations ---');
  
  // Ambil semua post yang tidak punya hashtag
  const postsToRepair = await prisma.post.findMany({
    where: {
      hashtags: { none: {} }
    }
  });

  console.log(`Found ${postsToRepair.length} posts without hashtags.`);

  // Mapping darurat: Jika judul mengandung kata tertentu, pasangkan hashtagnya
  const hashtagMap: Record<string, string> = {
    'Terrace': 'Nature',
    'Rice': 'Nature',
    'Beach': 'Nature',
    'Temple': 'Culture',
    'Ceremony': 'Culture',
    'Yoga': 'Wellness',
    'Hike': 'Adventure'
  };

  const hashtags = await prisma.hashtag.findMany();

  for (const post of postsToRepair) {
    let tagToConnect = hashtags[0]; // Default ke hashtag pertama jika tidak ketemu

    // Cari yang paling cocok berdasarkan mapping
    for (const [key, tag] of Object.entries(hashtagMap)) {
      if (post.title.includes(key)) {
        const found = hashtags.find(h => h.name.toLowerCase() === tag.toLowerCase());
        if (found) tagToConnect = found;
        break;
      }
    }

    if (tagToConnect) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          hashtags: {
            connect: [{ id: tagToConnect.id }]
          }
        }
      });
      console.log(`Updated [${post.title}] with tag #${tagToConnect.name}`);
    }
  }

  console.log('--- Done Repairing ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
