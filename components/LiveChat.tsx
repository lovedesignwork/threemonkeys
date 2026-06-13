'use client';

import { LiveChatWidget } from '@livechat/widget-react';

export default function LiveChat() {
  const license = process.env.NEXT_PUBLIC_LIVECHAT_LICENSE || '15436743';
  
  return (
    <LiveChatWidget
      license={license}
      visibility="minimized"
    />
  );
}
