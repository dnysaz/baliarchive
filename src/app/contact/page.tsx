import Link from 'next/link';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const dynamic = 'force-dynamic';

async function getContactSettings() {
  try {
    const settings = await (prisma as any).siteSettings.findFirst({
      where: { id: 1 },
    });
    return {
      title: settings?.contactTitle || 'Contact Us',
      content: settings?.contactContent || '',
    };
  } catch (error) {
    console.error('Failed to fetch contact settings:', error);
    return {
      title: 'Contact Us',
      content: '',
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContactSettings();
  return {
    title: `${settings.title} — BaliArchive`,
    description: 'Contact the BaliArchive team.',
  };
}

export default async function ContactPage() {
  const settings = await getContactSettings();

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
           <p className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Get in Touch</p>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 leading-none">
             {settings.title}
           </h1>
        </header>

        <div className="flex flex-col gap-16">
          {settings.content && (
            <article 
              className="prose prose-zinc max-w-none rich-text
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-zinc-900
                prose-p:text-zinc-600 prose-p:leading-[1.8] prose-p:text-lg
                prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                prose-strong:text-zinc-900 prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: settings.content }}
            />
          )}
          
          <div className="bg-white py-12 border-t border-zinc-100">
             <div className="mb-12">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter mb-2">Send us a message</h2>
                <p className="text-[12px] font-black uppercase tracking-widest text-zinc-400">We typically reply within 24 hours.</p>
             </div>
             <ContactForm />
          </div>
        </div>
        
        {/* Simple Footer / Navigation */}
        <footer className="mt-24 pt-12 border-t border-zinc-100 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-1">
             <Link href="/about" className="px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">About</Link>
             <span className="w-1 h-1 bg-zinc-200 rounded-full" />
             <Link href="/terms" className="px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">Terms & Conditions</Link>
          </div>
          <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">© {new Date().getFullYear()} BaliArchive</p>
        </footer>
      </main>
    </div>
  );
}
