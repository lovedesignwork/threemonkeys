'use client';

import { LiveChatWidget } from '@livechat/widget-react';
import { usePathname } from 'next/navigation';

export default function LiveChat() {
  const pathname = usePathname();

  // Never load the live chat widget on the admin dashboard.
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const license = process.env.NEXT_PUBLIC_LIVECHAT_LICENSE;

  // Only connect a widget explicitly configured for this restaurant.
  if (!license) return null;

  return (
    <LiveChatWidget
      license={license}
      visibility="minimized"
    />
  );
}
