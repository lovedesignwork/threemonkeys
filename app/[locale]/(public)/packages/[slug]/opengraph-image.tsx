import { ImageResponse } from 'next/og';
import { getPackageBySlug } from '@/lib/data/packages';

export const runtime = 'edge';
export const alt = 'Three Monkeys Restaurant Package';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

function formatPrice(price: number): string {
  return `฿${price.toLocaleString()}`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);

  const name = pkg?.name || 'Dining Package';
  const price = pkg?.price || 0;
  const priceType = pkg?.priceType === 'per-person' ? 'per person' : 'per table';
  const category = pkg?.category === 'zone' ? 'Dining Zone' 
    : pkg?.category === 'romantic' ? 'Romantic Experience' 
    : pkg?.category === 'combined' ? 'Combined Package'
    : 'Package';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(177, 185, 76, 0.2) 0%, transparent 50%)',
            display: 'flex',
          }}
        />
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            padding: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#b1b94c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                🐒
              </div>
              <span
                style={{
                  color: '#b1b94c',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}
              >
                THREE MONKEYS
              </span>
            </div>
            <span
              style={{
                padding: '10px 24px',
                backgroundColor: '#b1b94c',
                color: '#000',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 100,
              }}
            >
              {category}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <h1
              style={{
                fontSize: name.length > 30 ? 52 : 64,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.1,
                margin: 0,
                maxWidth: '80%',
              }}
            >
              {name}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: '#b1b94c',
                }}
              >
                {formatPrice(price)}
              </span>
              <span
                style={{
                  fontSize: 24,
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                {priceType}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 32,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <span style={{ fontSize: 20 }}>⭐</span>
                <span style={{ fontSize: 18 }}>4.8 Rating</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <span style={{ fontSize: 20 }}>📍</span>
                <span style={{ fontSize: 18 }}>Phuket</span>
              </div>
            </div>
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 16,
              }}
            >
              Book at threemonkeys.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
