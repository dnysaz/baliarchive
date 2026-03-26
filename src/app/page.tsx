import prisma from "@/lib/prisma";
import BaliArchive from "@/components/BaliArchive";

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      images: true,
    },
  });

  return <BaliArchive initialData={posts} />;
}
