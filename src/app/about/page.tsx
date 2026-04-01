import Link from 'next/link';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

async function getAboutSettings() {
  try {
    const settings = await (prisma as any).siteSettings.findFirst({
      where: { id: 1 },
    });
    return {
      title: settings?.aboutTitle || 'About BaliArchive',
      content: settings?.aboutContent || '<p>Welcome to BaliArchive. Discover Bali as locals know it.</p>',
    };
  } catch (error) {
    console.error('Failed to fetch about settings:', error);
    return {
      title: 'About BaliArchive',
      content: '<p>Welcome to BaliArchive. Discover Bali as locals know it.</p>',
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAboutSettings();
  return {
    title: `${settings.title} — BaliArchive`,
    description: 'Learn more about BaliArchive and our mission to archive Bali as the locals know it.',
  };
}

export default async function AboutPage() {
  const settings = await getAboutSettings();

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 overflow-y-auto selection:bg-amber-100 selection:text-amber-900">
      {/* Dynamic Header / Navbar */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
               <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-black text-zinc-900 tracking-tight group-hover:text-amber-600 transition-colors">BaliArchive</span>
          </Link>
          
          <Link href="/" className="px-4 py-2 bg-zinc-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/10">
            Back to Feed
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pt-12 pb-24">
        <header className="mb-12 border-b border-zinc-50 pb-8">
           <p className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Our Mission</p>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 leading-none">
             {settings.title}
           </h1>
        </header>

        <article 
          className="prose prose-zinc max-w-none rich-text
            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-zinc-900
            prose-p:text-zinc-600 prose-p:leading-[1.8] prose-p:text-lg
            prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-zinc-900 prose-strong:font-black
            prose-img:rounded-3xl prose-img:shadow-2xl
            prose-ul:list-none prose-ul:pl-0
            prose-li:relative prose-li:pl-6 prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.6em] prose-li:before:w-2 prose-li:before:h-2 prose-li:before:bg-amber-500 prose-li:before:rounded-full"
          dangerouslySetInnerHTML={{ __html: settings.content }}
        />
        
        {/* Simple Footer / Navigation */}
        <footer className="mt-24 pt-12 border-t border-zinc-100 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-1">
             <Link href="/terms" className="px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">Terms & Conditions</Link>
             <span className="w-1 h-1 bg-zinc-200 rounded-full" />
             <Link href="/contact" className="px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">Contact Us</Link>
          </div>
          <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">© {new Date().getFullYear()} BaliArchive</p>
        </footer>
      </main>
    </div>
  );
}
