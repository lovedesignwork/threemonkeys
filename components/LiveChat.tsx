'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
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
  const [timedOut, setTimedOut] = useState(false);
  const isPublic = Boolean(publicPath(pathname || '/'));

  useEffect(() => {
    if (!requested || ready || !isPublic) return;
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [requested, ready, isPublic]);

  // Payment, admin and private reservation URLs must not reach the chat vendor.
  // The adapter destroys its widget on unmount when entering these routes.
  if (!isPublic) return null;

  const license = process.env.NEXT_PUBLIC_LIVECHAT_LICENSE || '15436743';

  return (
    <>
      {!ready && <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2">
        {timedOut ? <>
          <p role="status" className="max-w-64 rounded-lg bg-black px-3 py-2 text-xs text-white">Chat is taking longer than expected.</p>
          <Link href="/contact" className="flex items-center gap-2 rounded-full bg-[#b1b94c] px-5 py-3 text-sm font-semibold text-black shadow-lg">
            <MessageCircle size={20} aria-hidden="true" /> Contact us
          </Link>
        </> : <button type="button" onClick={() => setRequested(true)} disabled={requested}
          className="flex items-center gap-2 rounded-full bg-[#b1b94c] px-5 py-3 text-sm font-semibold text-black shadow-lg disabled:opacity-75">
          <MessageCircle size={20} aria-hidden="true" />
          {requested ? 'Opening chat…' : 'Chat with us'}
        </button>}
        {requested && !timedOut && <Link href="/contact" className="rounded-full bg-black px-3 py-1 text-xs text-white underline">Contact details</Link>}
      </div>}
      {requested && <LiveChatWidget license={license} visibility="maximized" onReady={() => setReady(true)} />}
    </>
  );
}
