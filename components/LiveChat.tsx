'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { publicPath } from '@/lib/analytics';
import Link from 'next/link';

const LiveChatWidget = dynamic(
  () => import('@livechat/widget-react').then((module) => module.LiveChatWidget),
  { ssr: false },
);

export default function LiveChat() {
  const pathname = usePathname();
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);

  // Payment, admin and private reservation URLs must not reach the chat vendor.
  // The adapter destroys its widget on unmount when entering these routes.
  if (!publicPath(pathname || '/')) return null;

  const license = process.env.NEXT_PUBLIC_LIVECHAT_LICENSE || '15436743';

  return (
    <>
      {!ready && <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2">
        <button type="button" onClick={() => setRequested(true)} disabled={requested}
          className="flex items-center gap-2 rounded-full bg-[#b1b94c] px-5 py-3 text-sm font-semibold text-black shadow-lg disabled:opacity-75">
          <MessageCircle size={20} aria-hidden="true" />
          {requested ? 'Opening chat…' : 'Chat with us'}
        </button>
        {requested && <Link href="/contact" className="rounded-full bg-black px-3 py-1 text-xs text-white underline">Contact details</Link>}
      </div>}
      {requested && <LiveChatWidget license={license} visibility="maximized" onReady={() => setReady(true)} />}
    </>
  );
}
