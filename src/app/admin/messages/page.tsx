import React from 'react';
import prisma from '@/lib/prisma';
import AdminInbox from '@/components/AdminInbox';

export const dynamic = 'force-dynamic';

async function getMessages() {
  return await (prisma as any).message.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  return (
    <div className="p-4 lg:p-8 flex flex-col h-full overflow-hidden">
      <div className="mb-8 flex items-baseline justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Inbox</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
             Manage User Feedback
          </p>
        </div>
      </div>

      <AdminInbox messages={messages} />
    </div>
  );
}
