import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Three Monkeys Restaurant - Authentic Thai Cuisine in Phuket';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
            background: 'radial-gradient(circle at 30% 20%, rgba(177, 185, 76, 0.15) 0%, transparent 50%)',
            display: 'flex',
          }}
        />
        
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#b1b94c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            🐒
          </div>
          <span
            style={{
              color: '#b1b94c',
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            THREE MONKEYS
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 80px',
            marginTop: 40,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 24,
            }}
          >
            Authentic Thai Cuisine
          </h1>
          <p
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              marginBottom: 40,
              maxWidth: 800,
            }}
          >
            Experience Southern Thai flavors in Phuket&apos;s most magical rainforest setting
          </p>
          
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 36, color: '#b1b94c', fontWeight: 700 }}>4.8★</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }}>2,500+ Reviews</span>
            </div>
            <div
              style={{
                width: 1,
                height: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 36, color: '#b1b94c', fontWeight: 700 }}>🌿</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }}>Jungle Dining</span>
            </div>
            <div
              style={{
                width: 1,
                height: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 36, color: '#b1b94c', fontWeight: 700 }}>📍</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }}>Phuket, Thailand</span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 18,
            }}
          >
            threemonkeys.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
