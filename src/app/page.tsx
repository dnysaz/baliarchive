import prisma from "@/lib/prisma";
import BaliArchive from "@/components/BaliArchive";

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      images: true,
    },
  });

  // Transform data to match the expected format
  const formattedPosts = posts.map((post: any) => ({
    ...post,
    images: post.images.map((img: any) => ({
      id: img.id,
      url: img.url,
    })),
  }));

  return <BaliArchive initialData={formattedPosts} />;
}
