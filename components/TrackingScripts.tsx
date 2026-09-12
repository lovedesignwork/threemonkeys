'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { normalizePublicTracking, type PublicTrackingSettings } from '@/lib/tracking';

let trackingRequest: Promise<PublicTrackingSettings | null> | null = null;

function loadPublicTracking() {
  if (!trackingRequest) {
    trackingRequest = fetch('/api/tracking')
      .then(async (response) => {
        if (!response.ok) throw new Error('Tracking settings are unavailable');
        const data = await response.json();
        return normalizePublicTracking(data.tracking);
      })
      .catch((error) => {
        trackingRequest = null;
        console.error(error);
        return null;
      });
  }
  return trackingRequest;
}

function usePublicTracking() {
  const [tracking, setTracking] = useState<PublicTrackingSettings | null>(null);

  useEffect(() => {
    let active = true;
    loadPublicTracking().then((settings) => {
      if (active) setTracking(settings);
    });
    return () => { active = false; };
  }, []);

  return tracking;
}

export function TrackingScriptsHead() {
  const tracking = usePublicTracking();

  if (!tracking) return null;

  return (
    <>
      {tracking.verification.map(({ name, content }) => (
        <meta key={name} name={name} content={content} />
      ))}
      {tracking.gtmId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${tracking.gtmId}');
            `,
          }}
        />
      )}

      {tracking.ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${tracking.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${tracking.ga4Id}');
              `,
            }}
          />
        </>
      )}

      {tracking.metaPixelId && (
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${tracking.metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

    </>
  );
}

export function TrackingScriptsBody() {
  const tracking = usePublicTracking();

  if (!tracking) return null;

  return (
    <>
      {tracking.gtmId && (
        <noscript>
          <iframe
            title="Google Tag Manager"
            src={`https://www.googletagmanager.com/ns.html?id=${tracking.gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}

      {tracking.metaPixelId && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${tracking.metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}

    </>
  );
}
