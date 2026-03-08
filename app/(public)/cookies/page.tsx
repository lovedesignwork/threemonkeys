'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Cookie, 
  Shield, 
  BarChart3, 
  Target, 
  Settings,
  FileText,
  Mail,
  Phone,
  ChevronRight,
  ArrowUp,
  ExternalLink,
  Globe,
  Lock,
  Database,
  Sliders
} from 'lucide-react';

const sections = [
  { id: 'what-are', title: 'What Are Cookies?', icon: Cookie },
  { id: 'types', title: 'Types of Cookies', icon: Database },
  { id: 'third-party', title: 'Third-Party Cookies', icon: Globe },
  { id: 'managing', title: 'Managing Cookies', icon: Sliders },
  { id: 'similar', title: 'Similar Technologies', icon: Settings },
  { id: 'updates', title: 'Policy Updates', icon: FileText },
  { id: 'contact', title: 'Contact Us', icon: Mail },
];

const cookieTypes = [
  {
    id: 'essential',
    title: 'Essential Cookies',
    icon: Shield,
    color: 'green',
    description: 'Required for basic website functionality. Cannot be disabled.',
    cookies: [
      { name: 'session_id', purpose: 'Maintains your session during booking', duration: 'Session' },
      { name: 'csrf_token', purpose: 'Security - prevents cross-site request forgery', duration: 'Session' },
      { name: 'cookie_consent', purpose: 'Stores your cookie preferences', duration: '1 year' },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics Cookies',
    icon: BarChart3,
    color: 'blue',
    description: 'Help us understand how visitors use our website.',
    cookies: [
      { name: '_ga', purpose: 'Distinguishes unique users', duration: '2 years', provider: 'Google Analytics' },
      { name: '_ga_*', purpose: 'Maintains session state', duration: '2 years', provider: 'Google Analytics 4' },
      { name: '_gid', purpose: 'Distinguishes users', duration: '24 hours', provider: 'Google Analytics' },
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing Cookies',
    icon: Target,
    color: 'purple',
    description: 'Used for targeted advertising and remarketing.',
    cookies: [
      { name: '_fbp', purpose: 'Tracks visits for Facebook ads', duration: '3 months', provider: 'Meta (Facebook)' },
      { name: '_gcl_au', purpose: 'Conversion tracking', duration: '3 months', provider: 'Google Ads' },
    ]
  },
  {
    id: 'preference',
    title: 'Preference Cookies',
    icon: Settings,
    color: 'amber',
    description: 'Remember your settings and preferences.',
    cookies: [
      { name: 'language', purpose: 'Remembers your language preference', duration: '1 year' },
      { name: 'currency', purpose: 'Remembers your currency preference', duration: '1 year' },
    ]
  },
];

const browserLinks = [
  { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
  { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
  { name: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
  { name: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
];

export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState('what-are');
  const [expandedCookie, setExpandedCookie] = useState<string | null>('essential');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'bg-green-500/20' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/20' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'bg-purple-500/20' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'bg-amber-500/20' },
    };
    return colors[color] || colors.green;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920"
            alt="Cookie policy"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#0a0a0a]" />
        </div>
        
        <div className="relative z-10 text-center px-4 py-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Cookie className="w-4 h-4 text-[#b1b94c]" />
              <span className="text-sm text-white/80">Transparency First</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-6">
              Cookie Policy
            </h1>
            
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-4">
              Understanding how we use cookies to improve your experience
            </p>
            
            <p className="text-sm text-white/40">
              Last updated: February 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cookie Type Overview Cards */}
      <section className="py-8 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {cookieTypes.map((type) => {
              const colors = getColorClasses(type.color);
              return (
                <div 
                  key={type.id}
                  className={`bg-[#111] rounded-2xl border ${colors.border} p-4`}
                >
                  <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center mb-3`}>
                    <type.icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h3 className={`font-medium ${colors.text} mb-1 text-sm`}>{type.title}</h3>
                  <p className="text-white/50 text-xs">{type.description}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-28">
                <div className="bg-[#111] rounded-2xl border border-white/10 p-4">
                  <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 px-2">
                    Quick Navigation
                  </h3>
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          activeSection === section.id
                            ? 'bg-[#b1b94c]/20 text-[#b1b94c]'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <section.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                
                <button
                  onClick={scrollToTop}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-sm">Back to Top</span>
                </button>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="space-y-12">
                {/* What Are Cookies */}
                <div id="what-are" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#b1b94c]/20 flex items-center justify-center">
                        <Cookie className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        1. What Are Cookies?
                      </h2>
                    </div>
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>
                        Cookies are small text files that are stored on your device (computer, tablet, 
                        or mobile phone) when you visit a website. They are widely used to make websites 
                        work more efficiently and provide information to website owners.
                      </p>
                      <p>
                        This Cookie Policy explains how <span className="text-white font-medium">SKY WORLD ADVENTURES Co., Ltd.</span> 
                        (operating as "Three Monkeys") uses cookies and similar technologies on our website.
                      </p>
                      
                      <div className="bg-white/5 rounded-2xl p-6 mt-6">
                        <h4 className="text-white font-medium mb-3">Cookies help us to:</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            'Remember your preferences',
                            'Keep you signed in',
                            'Understand how you use our site',
                            'Improve your experience',
                            'Show relevant content',
                            'Measure marketing effectiveness'
                          ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-white/60">
                              <ChevronRight className="w-4 h-4 text-[#b1b94c]" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Types of Cookies */}
                <div id="types" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Database className="w-6 h-6 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        2. Types of Cookies We Use
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      {cookieTypes.map((type) => {
                        const colors = getColorClasses(type.color);
                        const isExpanded = expandedCookie === type.id;
                        
                        return (
                          <div 
                            key={type.id}
                            className={`rounded-2xl border ${colors.border} overflow-hidden transition-all`}
                          >
                            <button
                              onClick={() => setExpandedCookie(isExpanded ? null : type.id)}
                              className={`w-full p-6 flex items-center justify-between ${colors.bg}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center`}>
                                  <type.icon className={`w-5 h-5 ${colors.text}`} />
                                </div>
                                <div className="text-left">
                                  <h3 className={`font-medium ${colors.text}`}>{type.title}</h3>
                                  <p className="text-white/50 text-sm">{type.description}</p>
                                </div>
                              </div>
                              <ChevronRight 
                                className={`w-5 h-5 ${colors.text} transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              />
                            </button>
                            
                            {isExpanded && (
                              <div className="p-6 bg-white/5">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-white/10">
                                        <th className="text-left p-3 text-white/60 font-medium">Cookie Name</th>
                                        {type.cookies[0].provider && (
                                          <th className="text-left p-3 text-white/60 font-medium">Provider</th>
                                        )}
                                        <th className="text-left p-3 text-white/60 font-medium">Purpose</th>
                                        <th className="text-left p-3 text-white/60 font-medium">Duration</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {type.cookies.map((cookie, index) => (
                                        <tr key={index} className="border-b border-white/5 last:border-0">
                                          <td className="p-3 text-white font-mono text-xs">{cookie.name}</td>
                                          {cookie.provider && (
                                            <td className="p-3 text-white/60">{cookie.provider}</td>
                                          )}
                                          <td className="p-3 text-white/60">{cookie.purpose}</td>
                                          <td className="p-3 text-white/60">{cookie.duration}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Third-Party Cookies */}
                <div id="third-party" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        3. Third-Party Cookies
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>
                        Some cookies are placed by third-party services that appear on our pages. 
                        We do not control these cookies. The third parties include:
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-4 my-6">
                        {[
                          { name: 'Google Analytics', desc: 'Website analytics and performance' },
                          { name: 'Google Tag Manager', desc: 'Tag management for marketing' },
                          { name: 'Meta (Facebook) Pixel', desc: 'Advertising and conversion tracking' },
                          { name: 'Stripe', desc: 'Secure payment processing' }
                        ].map((item, index) => (
                          <div key={index} className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-white font-medium mb-1">{item.name}</h4>
                            <p className="text-white/50 text-sm">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-sm">
                        Please refer to these third parties' privacy policies for more information:
                      </p>
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a 
                          href="https://policies.google.com/privacy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-[#b1b94c] hover:bg-white/10 transition-colors text-sm"
                        >
                          Google Privacy Policy
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a 
                          href="https://www.facebook.com/privacy/policy/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-[#b1b94c] hover:bg-white/10 transition-colors text-sm"
                        >
                          Meta Privacy Policy
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a 
                          href="https://stripe.com/privacy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-[#b1b94c] hover:bg-white/10 transition-colors text-sm"
                        >
                          Stripe Privacy Policy
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Managing Cookies */}
                <div id="managing" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                        <Sliders className="w-6 h-6 text-teal-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        4. Managing Cookies
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">4.1 Cookie Consent</h3>
                        <p className="text-white/70">
                          When you first visit our website, you will see a cookie consent banner that 
                          allows you to accept or customize your cookie preferences. You can change 
                          your preferences at any time by clicking the "Cookie Settings" link in the 
                          footer of our website.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">4.2 Browser Settings</h3>
                        <p className="text-white/70 mb-4">
                          Most web browsers allow you to control cookies through their settings. You can:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 mb-6">
                          {[
                            'View stored cookies',
                            'Delete all or specific cookies',
                            'Block cookies from websites',
                            'Block third-party cookies',
                            'Accept all cookies',
                            'Get notified when cookies are set'
                          ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-white/60">
                              <ChevronRight className="w-4 h-4 text-teal-400" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-white/70 text-sm mb-4">
                          Cookie management instructions for popular browsers:
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                          {browserLinks.map((browser, index) => (
                            <a 
                              key={index}
                              href={browser.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-white/70 hover:text-[#b1b94c] hover:bg-white/10 transition-colors text-sm"
                            >
                              {browser.name}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-amber-400 mb-4">4.3 Impact of Disabling Cookies</h3>
                        <p className="text-white/70 mb-4">
                          Please note that if you disable or block certain cookies, some features may not function properly:
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-white font-medium">Essential cookies disabled:</span>
                              <span className="text-white/60 ml-2">You may not be able to complete bookings</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Settings className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-white font-medium">Preference cookies disabled:</span>
                              <span className="text-white/60 ml-2">Your settings won't be remembered</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <BarChart3 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-white font-medium">Analytics cookies disabled:</span>
                              <span className="text-white/60 ml-2">No impact on functionality</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-white font-medium">Marketing cookies disabled:</span>
                              <span className="text-white/60 ml-2">Ads won't be personalized</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Similar Technologies */}
                <div id="similar" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                        <Settings className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        5. Similar Technologies
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>
                        In addition to cookies, we may use similar technologies such as:
                      </p>
                      
                      <div className="grid sm:grid-cols-3 gap-4 my-6">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3">
                            <Database className="w-5 h-5 text-indigo-400" />
                          </div>
                          <h4 className="text-white font-medium mb-1">Local Storage</h4>
                          <p className="text-white/50 text-sm">Stores data with no expiration date</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
                            <Lock className="w-5 h-5 text-cyan-400" />
                          </div>
                          <h4 className="text-white font-medium mb-1">Session Storage</h4>
                          <p className="text-white/50 text-sm">Stores data for browser session</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center mb-3">
                            <Target className="w-5 h-5 text-pink-400" />
                          </div>
                          <h4 className="text-white font-medium mb-1">Pixels/Web Beacons</h4>
                          <p className="text-white/50 text-sm">Small images to track behavior</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-white/50">
                        These technologies are subject to the same consent requirements as cookies.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Policy Updates */}
                <div id="updates" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-orange-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        6. Updates to This Policy
                      </h2>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white/70">
                        We may update this Cookie Policy from time to time to reflect changes in 
                        technology, legislation, or our business practices. The "Last updated" date 
                        at the top of this page indicates when the policy was last revised.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Us */}
                <div id="contact" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#b1b94c]/20 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        7. Contact Us
                      </h2>
                    </div>
                    
                    <p className="text-white/70 mb-6">
                      If you have questions about our use of cookies or this Cookie Policy, 
                      please contact us:
                    </p>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white/70">
                          <Mail className="w-5 h-5 text-[#b1b94c]" />
                          <span>privacy@threemonkeys.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                          <Phone className="w-5 h-5 text-[#b1b94c]" />
                          <span>+66 76 323 264</span>
                        </div>
                        <div className="flex items-start gap-3 text-white/70">
                          <Globe className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>89/16 Moo 6, Soi Namtok Kathu, Kathu, Phuket 83120, Thailand</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-white/5 rounded-xl">
                      <p className="text-white/60 text-sm">
                        For more information about how we handle your personal data, please see our{' '}
                        <Link href="/privacy" className="text-[#b1b94c] hover:underline">Privacy Policy</Link>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Related Links */}
              <div className="mt-12 p-6 bg-[#111] rounded-3xl border border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Related Policies</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Link 
                    href="/terms"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-[#b1b94c]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Terms & Conditions</span>
                  </Link>
                  <Link 
                    href="/privacy"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <Shield className="w-5 h-5 text-[#b1b94c]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Privacy Policy</span>
                  </Link>
                  <Link 
                    href="/refund"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-[#b1b94c]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Refund Policy</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
