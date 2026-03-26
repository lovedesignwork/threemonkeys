'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { Section, Container, SectionHeader, Button } from '@/components/ui';

export function InstagramFeed() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Section className="relative overflow-hidden" style={{ backgroundColor: '#0d1259' }}>
      {/* Big Circle Background Decorations */}
      <img 
        src="/images/circlebig.png"
        alt=""
        className="absolute w-[600px] h-[600px] opacity-15 pointer-events-none object-contain top-[-15%] left-[-10%] animate-spin-slow"
      />
      <img 
        src="/images/circlebig.png"
        alt=""
        className="absolute w-[600px] h-[600px] opacity-15 pointer-events-none object-contain bottom-[-15%] right-[-10%] animate-spin-slow-reverse"
      />
      
      <Container className="relative z-10">
        <SectionHeader
          title="Follow Our Culinary Journey"
          subtitle="Join our community and share your Three Monkeys dining experience"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          {/* Instagram Profile Embed */}
          <div className="p-[3px] rounded-2xl animated-silver-border w-full max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/90 to-primary-dark rounded-2xl p-8 animated-card-bg-purple overflow-hidden relative">
              {/* Circle decoration */}
              <img 
                src="/images/circlebg.png" 
                alt="" 
                className="absolute opacity-10 pointer-events-none animate-circle-orbit-1"
                style={{ width: '250px', height: '250px', top: '-30px', right: '-30px' }}
              />
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Profile Info */}
                <div className="flex-shrink-0 text-center md:text-left">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-1 mx-auto md:mx-0">
                    <div className="w-full h-full rounded-full bg-primary-dark flex items-center justify-center">
                      <Instagram className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-white font-[family-name:var(--font-oswald)]">
                    @threemonkeysphuket
                  </h3>
                  <p className="text-white/60 mt-1">Official Instagram</p>
                </div>
                
                {/* Stats */}
                <div className="flex-grow">
                  <div className="grid grid-cols-3 gap-6 text-center mb-6">
                    <div>
                      <div className="text-3xl font-bold text-white font-[family-name:var(--font-oswald)]">500+</div>
                      <div className="text-white/60 text-sm">Posts</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white font-[family-name:var(--font-oswald)]">15K+</div>
                      <div className="text-white/60 text-sm">Followers</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white font-[family-name:var(--font-oswald)]">1K+</div>
                      <div className="text-white/60 text-sm">Following</div>
                    </div>
                  </div>
                  
                  <p className="text-white/80 text-center md:text-left mb-6">
                    🍽️ Authentic Thai Fine Dining<br />
                    📍 Phuket, Thailand<br />
                    🥢 Thai Cuisine • Tasting Menus • Cooking Classes
                  </p>
                  
                  <a 
                    href="https://www.instagram.com/threemonkeysrestaurant/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white border-0"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      Follow on Instagram
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/60 mt-8 text-center">
            Tag us in your photos with <span className="text-accent font-semibold">#ThreeMonkeysPhuket</span> for a chance to be featured!
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}
