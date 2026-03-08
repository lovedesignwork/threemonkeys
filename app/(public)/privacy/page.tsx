'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Shield, 
  Database, 
  Eye, 
  Lock, 
  Globe, 
  Users, 
  Cookie,
  FileText,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ArrowUp,
  Building,
  CreditCard,
  Clock,
  Server
} from 'lucide-react';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: Shield },
  { id: 'controllers', title: 'Data Controllers', icon: Building },
  { id: 'collection', title: 'Information We Collect', icon: Database },
  { id: 'usage', title: 'How We Use Your Data', icon: Eye },
  { id: 'legal-basis', title: 'Legal Basis', icon: FileText },
  { id: 'sharing', title: 'Information Sharing', icon: Users },
  { id: 'security', title: 'Data Security', icon: Lock },
  { id: 'rights', title: 'Your Rights (PDPA)', icon: Shield },
  { id: 'cookies', title: 'Cookies', icon: Cookie },
  { id: 'retention', title: 'Data Retention', icon: Clock },
  { id: 'transfers', title: 'International Transfers', icon: Globe },
  { id: 'contact', title: 'Contact Us', icon: Mail },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('introduction');

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

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920"
            alt="Privacy and security"
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
              <Shield className="w-4 h-4 text-[#b1b94c]" />
              <span className="text-sm text-white/80">Your Privacy Matters</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-6">
              Privacy Policy
            </h1>
            
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-4">
              Learn how we collect, use, and protect your personal information
            </p>
            
            <p className="text-sm text-white/40">
              Last updated: February 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* PDPA Compliance Badge */}
      <section className="py-8 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-[#111] rounded-full border border-white/10">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-white/80">PDPA Compliant</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-[#111] rounded-full border border-white/10">
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-white/80">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-[#111] rounded-full border border-white/10">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-white/80">PCI-DSS Level 1</span>
            </div>
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
                {/* Introduction */}
                <div id="introduction" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#b1b94c]/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        1. Introduction
                      </h2>
                    </div>
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>
                        This Privacy Policy explains how <span className="text-white font-medium">SKY WORLD ADVENTURES Co., Ltd.</span> 
                        (operating as "Three Monkeys") and <span className="text-white font-medium">Chamnanthang Co., Ltd.</span> 
                        (operating as "ONEBOOKING" for online payment processing) collect, use, disclose, 
                        and safeguard your information when you visit our website or use our services.
                      </p>
                      <p>
                        We are committed to protecting your privacy and complying with the Thailand 
                        Personal Data Protection Act (PDPA) and other applicable data protection laws.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Controllers */}
                <div id="controllers" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        2. Data Controllers
                      </h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-xl bg-[#b1b94c]/20 flex items-center justify-center mb-4">
                          <Building className="w-5 h-5 text-[#b1b94c]" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">SKY WORLD ADVENTURES Co., Ltd.</h3>
                        <p className="text-white/60 text-sm">
                          Data controller for information related to your visit, dining experience, 
                          and general customer service.
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                          <CreditCard className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Chamnanthang Co., Ltd.</h3>
                        <p className="text-white/60 text-sm">
                          Data controller for online booking and payment processing. Your credit card 
                          statement will display payments as "ONEBOOKING".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information We Collect */}
                <div id="collection" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                        <Database className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        3. Information We Collect
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">3.1 Personal Information</h3>
                        <p className="text-white/70 mb-4">We may collect personal information that you provide to us, including:</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            'Name (first and last)',
                            'Email address',
                            'Phone number and country code',
                            'Hotel name and room number',
                            'Special requests',
                            'Dietary requirements'
                          ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-white/60">
                              <ChevronRight className="w-4 h-4 text-[#b1b94c]" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">3.2 Payment Information</h3>
                        <p className="text-white/70">
                          Payment information is processed securely by our payment processor, Stripe. 
                          We do not store your full credit card details on our servers. Stripe is 
                          PCI-DSS Level 1 certified, the highest level of certification in the payment industry.
                        </p>
                        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl w-fit">
                          <Lock className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">PCI-DSS Level 1 Certified</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">3.3 Automatically Collected Information</h3>
                        <p className="text-white/70 mb-4">When you visit our website, we may automatically collect:</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            'IP address',
                            'Browser type and version',
                            'Device type and OS',
                            'Pages visited',
                            'Time spent on pages',
                            'Geographic location'
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

                {/* How We Use Your Data */}
                <div id="usage" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-amber-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        4. How We Use Your Information
                      </h2>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white/70 mb-4">We use the information we collect to:</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          'Process and manage your bookings',
                          'Send booking confirmations & reminders',
                          'Arrange transportation services',
                          'Provide customer support',
                          'Process payments and refunds',
                          'Improve our services',
                          'Comply with legal obligations',
                          'Send promotional communications (with consent)',
                          'Analyze website performance'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-2 text-white/60">
                            <ChevronRight className="w-4 h-4 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Basis */}
                <div id="legal-basis" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        5. Legal Basis for Processing
                      </h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-medium mb-2">Contract</h3>
                        <p className="text-white/60 text-sm">To fulfill our booking agreement with you</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-medium mb-2">Consent</h3>
                        <p className="text-white/60 text-sm">For marketing communications and non-essential cookies</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-medium mb-2">Legitimate Interest</h3>
                        <p className="text-white/60 text-sm">To improve our services and prevent fraud</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-medium mb-2">Legal Obligation</h3>
                        <p className="text-white/60 text-sm">To comply with tax, accounting, and safety regulations</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Sharing */}
                <div id="sharing" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-pink-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        6. Information Sharing
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-white/70">We may share your information with:</p>
                      
                      <div className="space-y-3">
                        {[
                          { title: 'Payment Processors', desc: 'Stripe processes all online payments on behalf of Chamnanthang Co., Ltd. (ONEBOOKING)' },
                          { title: 'Email Service Providers', desc: 'To send booking confirmations and communications (e.g., Resend)' },
                          { title: 'Transportation Partners', desc: 'Hotel and pickup location details for transfer arrangements' },
                          { title: 'Analytics Providers', desc: 'Aggregated, anonymized data for website analytics (e.g., Google Analytics)' },
                          { title: 'Legal Authorities', desc: 'When required by law, court order, or to protect our legal rights' }
                        ].map((item, index) => (
                          <div key={index} className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-white font-medium mb-1">{item.title}</h4>
                            <p className="text-white/60 text-sm">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-green-400 text-sm font-medium">
                          We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Security */}
                <div id="security" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-green-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        7. Data Security
                      </h2>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white/70 mb-4">
                        We implement appropriate technical and organizational measures to protect your personal information:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          'SSL/TLS encryption (HTTPS)',
                          'Secure database storage',
                          'Access controls',
                          'Regular security assessments',
                          'PCI-DSS compliant payments',
                          'Employee training',
                          'Incident response procedures'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-white/60">
                            <Lock className="w-4 h-4 text-green-400" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your Rights (PDPA) */}
                <div id="rights" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#b1b94c]/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        8. Your Rights Under PDPA
                      </h2>
                    </div>
                    
                    <p className="text-white/70 mb-6">
                      Under the Thailand Personal Data Protection Act, you have the right to:
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { title: 'Access', desc: 'Request a copy of the personal data we hold about you' },
                        { title: 'Rectification', desc: 'Request correction of inaccurate or incomplete data' },
                        { title: 'Erasure', desc: 'Request deletion of your personal data' },
                        { title: 'Restriction', desc: 'Request limitation of processing' },
                        { title: 'Data Portability', desc: 'Receive your data in a structured format' },
                        { title: 'Objection', desc: 'Object to processing based on legitimate interests' },
                        { title: 'Withdraw Consent', desc: 'Withdraw consent for marketing at any time' },
                        { title: 'Complaint', desc: 'Lodge a complaint with the PDPC' }
                      ].map((item, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-[#b1b94c] font-medium mb-1">{item.title}</h4>
                          <p className="text-white/60 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cookies */}
                <div id="cookies" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                        <Cookie className="w-6 h-6 text-orange-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        9. Cookies and Tracking
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70">
                      <p>
                        Our website uses cookies and similar technologies to enhance your experience. 
                        For detailed information about the cookies we use and how to manage them, 
                        please see our <Link href="/cookies" className="text-[#b1b94c] hover:underline">Cookie Policy</Link>.
                      </p>
                      
                      <div className="grid sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                          <h4 className="text-green-400 font-medium mb-1">Essential</h4>
                          <p className="text-green-400/70 text-sm">Required for website functionality</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <h4 className="text-blue-400 font-medium mb-1">Analytics</h4>
                          <p className="text-blue-400/70 text-sm">Help us understand usage</p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                          <h4 className="text-purple-400 font-medium mb-1">Marketing</h4>
                          <p className="text-purple-400/70 text-sm">For targeted advertising</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Retention */}
                <div id="retention" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-teal-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        10. Data Retention
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-white/70">We retain your personal information for:</p>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-[#b1b94c]" />
                            <h4 className="text-white font-medium">Booking Records</h4>
                          </div>
                          <p className="text-white/60 text-sm">7 years (for tax and accounting)</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-[#b1b94c]" />
                            <h4 className="text-white font-medium">Marketing Preferences</h4>
                          </div>
                          <p className="text-white/60 text-sm">Until you withdraw consent</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Server className="w-4 h-4 text-[#b1b94c]" />
                            <h4 className="text-white font-medium">Website Analytics</h4>
                          </div>
                          <p className="text-white/60 text-sm">26 months (anonymized)</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-[#b1b94c]" />
                            <h4 className="text-white font-medium">Customer Support</h4>
                          </div>
                          <p className="text-white/60 text-sm">3 years after last interaction</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* International Transfers */}
                <div id="transfers" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-violet-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        11. International Data Transfers
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70">
                      <p>
                        Your information may be transferred to and processed in countries other than Thailand, including:
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <h4 className="text-white font-medium">United States</h4>
                          </div>
                          <p className="text-white/60 text-sm">Stripe payment processing, cloud services</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <h4 className="text-white font-medium">European Union</h4>
                          </div>
                          <p className="text-white/60 text-sm">Email services</p>
                        </div>
                      </div>
                      
                      <p className="text-sm">
                        We ensure appropriate safeguards are in place for such transfers, including 
                        standard contractual clauses and adequacy decisions where applicable.
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
                        12. Contact Us
                      </h2>
                    </div>
                    
                    <p className="text-white/70 mb-6">
                      If you have questions about this Privacy Policy, wish to exercise your 
                      rights, or have concerns about our data practices, please contact us:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">General Inquiries</h3>
                        <p className="text-sm text-white/40 mb-4">SKY WORLD ADVENTURES Co., Ltd.</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <Mail className="w-4 h-4 text-[#b1b94c]" />
                            <span>privacy@threemonkeys.com</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <Phone className="w-4 h-4 text-[#b1b94c]" />
                            <span>+66 76 323 264</span>
                          </div>
                          <div className="flex items-start gap-3 text-white/70">
                            <MapPin className="w-4 h-4 text-[#b1b94c] flex-shrink-0 mt-1" />
                            <span className="text-sm">89/16 Moo 6, Soi Namtok Kathu, Kathu, Phuket 83120, Thailand</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Payment & Booking Inquiries</h3>
                        <p className="text-sm text-white/40 mb-4">Chamnanthang Co., Ltd. / ONEBOOKING</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <Mail className="w-4 h-4 text-[#b1b94c]" />
                            <span>support@onebooking.co</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <Globe className="w-4 h-4 text-[#b1b94c]" />
                            <span>onebooking.co</span>
                          </div>
                        </div>
                      </div>
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
                    href="/refund"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <CreditCard className="w-5 h-5 text-[#b1b94c]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Refund Policy</span>
                  </Link>
                  <Link 
                    href="/cookies"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <Cookie className="w-5 h-5 text-[#b1b94c]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Cookie Policy</span>
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
