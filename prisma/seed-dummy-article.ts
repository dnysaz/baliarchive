import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const title = "Jatiluwih Rice Terraces: A UNESCO World Heritage Treasure";
  const tagline = "Experience the soul of Bali in its most vast and ancient green amphitheater.";
  const kabupaten = "Tabanan";
  const category = "nature";
  
  // Ensure location and hashtag exist
  const location = await (prisma as any).location.upsert({
    where: { name: kabupaten },
    update: {},
    create: { name: kabupaten },
  });

  const hashtag = await (prisma as any).hashtag.upsert({
    where: { name: category },
    update: {},
    create: { name: category },
  });

  const body = `
    <h2>The Majesty of Jatiluwih</h2>
    <p>Located in the heart of the Tabanan Regency, <strong>Jatiluwih Rice Terraces</strong> comprise over 600 hectares of rice fields that follow the flowing hillside topography of the Batukaru mountain range. These are maintained by a traditional water management system known as <em>Subak</em>, which dates back to the 9th century.</p>
    
    <h3>The Subak System</h3>
    <p>Designated as a UNESCO World Heritage site in 2012, Jatiluwih is a living manifestation of the <em>Tri Hita Karana</em> philosophy—the harmony between people, nature, and the spiritual realm. The complex network of canals and weirs ensures that every farmer receives an equitable share of water, a practice that has sustained Balinese agriculture for over a millennium.</p>
    
    <h3>What to Expect</h3>
    <p>When you arrive, you'll be greeted by an endless expanse of vibrant green terraces. Unlike the more touristy Tegalalang, Jatiluwih offers a more peaceful and expansive experience. There are several trekking paths of varying lengths:</p>
    <ul>
      <li><strong>Short Track (Red):</strong> 45-60 minutes, perfect for a quick stroll.</li>
      <li><strong>Medium Track (Blue):</strong> 1.5-2 hours, takes you deeper into the fields.</li>
      <li><strong>Long Track (White):</strong> 3-4 hours, reaches the edge of the forest.</li>
    </ul>

    <h3>Best Time to Visit</h3>
    <p>The best time to visit Jatiluwih is during the early morning, around 06:30 AM to 08:30 AM. During this time, the air is cool, and the morning light creates stunning shadows across the terraces. Harvest season usually occurs in June or July, when the fields turn a golden yellow.</p>

    <h3>Pro Tips for Visitors</h3>
    <ol>
      <li>Bring comfortable walking shoes as the paths can be muddy after rain.</li>
      <li>Hire a local guide to learn more about the farming process and hidden temples.</li>
      <li>Stop at one of the local warungs for a cup of red rice tea, a specialty of the region.</li>
    </ol>
    
    <p>Jatiluwih is not just a place for photos; it's a place to witness the resilience of Balinese culture and the breathtaking scale of human ingenuity working in tandem with nature. For more information, visit the official UNESCO site at https://whc.unesco.org/en/list/1116</p>
  `;

  const existingImages = [
    "/uploads/0875796a-c12e-4a8e-bc64-2502d7cc48ae.blob",
    "/uploads/1634cc56-4ed3-4e52-9091-f83ff6bbe2e7.blob",
    "/uploads/2bf228ef-54d4-4be0-98e3-275475c9c6c8.blob",
    "/uploads/9042aa20-e23a-4b01-aa53-410dbd742043.blob",
    "/uploads/967a5439-2ba1-4c80-b216-d6882ba98380.blob"
  ];

  const post = await (prisma as any).post.create({
    data: {
      kabupaten: kabupaten,
      province: "Bali",
      category: category,
      title: title,
      tagline: tagline,
      likes: 124,
      saves: 56,
      bestTime: "06:30 AM",
      howToGet: "Private car or motorbike from Ubud (1.5h) or Canggu (2h). The roads are winding but well-paved.",
      cost: "Rp 40,000 (Adult), Rp 30,000 (Child)",
      body: body,
      venue: "Jatiluwih Village",
      guidePdfUrl: "/uploads/ed045183-b5fd-454f-85ec-bd5c3930a24e.pdf",
      guidePrice: "45,000",
      location: { connect: { id: location.id } },
      hashtag: { connect: { id: hashtag.id } },
      images: {
        create: existingImages.map(url => ({ url }))
      }
    }
  });

  console.log("Successfully created dummy post:", post.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
