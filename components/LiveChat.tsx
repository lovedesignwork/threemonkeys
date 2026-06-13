'use client';

import { LiveChatWidget } from '@livechat/widget-react';
import { usePathname } from 'next/navigation';

export default function LiveChat() {
  const pathname = usePathname();

  // Never load the live chat widget on the admin dashboard.
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const license = process.env.NEXT_PUBLIC_LIVECHAT_LICENSE || '15436743';

  return (
    <LiveChatWidget
      license={license}
      visibility="minimized"
    />
  );
}
