'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  RefreshCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MessageCircle,
  ChevronRight,
  ArrowUp,
  CreditCard,
  Shield,
  Calendar,
  Users,
  Percent
} from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Overview', icon: FileText },
  { id: 'standard', title: 'Standard Cancellation', icon: Clock },
  { id: 'medical', title: 'Medical & Emergency', icon: AlertCircle },
  { id: 'by-us', title: 'Cancellation by Us', icon: RefreshCcw },
  { id: 'third-party', title: 'Third-Party Bookings', icon: Users },
  { id: 'partial', title: 'Partial Refunds', icon: Percent },
  { id: 'process', title: 'Refund Process', icon: CreditCard },
  { id: 'non-refundable', title: 'Non-Refundable Items', icon: XCircle },
  { id: 'disputes', title: 'Disputes', icon: Shield },
  { id: 'contact', title: 'Contact', icon: Mail },
];

export default function RefundPage() {
  const [activeSection, setActiveSection] = useState('overview');

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
            src="/images/Random images/44_resize.jpg"
            alt="Refund policy"
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
              <RefreshCcw className="w-4 h-4 text-[#b1b94c]" />
              <span className="text-sm text-white/80">Transparent Policy</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-6">
              Refund Policy
            </h1>
            
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-4">
              Clear and fair refund guidelines for your peace of mind
            </p>
            
            <p className="text-sm text-white/40">
              Last updated: February 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <section className="py-8 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4"
          >
            <div className="bg-[#111] rounded-2xl border border-green-500/20 p-6">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-green-400 mb-2">Full Refund</h3>
              <p className="text-white/60 text-sm">
                Cancel 24+ hours before reservation<br />
                <span className="text-white/40">(5% processing fee applies)</span>
              </p>
            </div>
            
            <div className="bg-[#111] rounded-2xl border border-amber-500/20 p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-amber-400 mb-2">Medical Cases</h3>
              <p className="text-white/60 text-sm">
                With valid medical certificate<br />
                <span className="text-white/40">(5% processing fee applies)</span>
              </p>
            </div>
            
            <div className="bg-[#111] rounded-2xl border border-red-500/20 p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-red-400 mb-2">No Refund</h3>
              <p className="text-white/60 text-sm">
                Less than 24 hours notice<br />
                <span className="text-white/40">or no-show</span>
              </p>
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
                {/* Overview */}
                <div id="overview" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#b1b94c]/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        1. Overview
                      </h2>
                    </div>
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>
                        This Refund Policy applies to all online bookings made through our website. 
                        Payments are processed by <span className="text-white font-medium">Chamnanthang Co., Ltd.</span> (operating 
                        as "ONEBOOKING"). Your credit card statement will display the payment as "ONEBOOKING".
                      </p>
                      
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-blue-400 font-medium mb-2">Important Note</h4>
                            <p className="text-blue-400/80 text-sm">
                              A <span className="font-medium">5% processing fee</span> will be deducted from all refunds 
                              to cover payment gateway and administrative costs.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Standard Cancellation */}
                <div id="standard" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-green-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        2. Standard Cancellation & Refund
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-green-400 mb-4">2.1 More Than 24 Hours Before Reservation</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span><span className="text-white font-medium">Refund:</span> Full refund minus 5% processing fee</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span><span className="text-white font-medium">Processing Time:</span> 5-10 business days</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span><span className="text-white font-medium">How to Cancel:</span> Email support@threemonkeys.com</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-amber-400 mb-4">2.2 Less Than 24 Hours Before Reservation</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span><span className="text-white font-medium">Refund:</span> No refund available</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span><span className="text-white font-medium">Alternative:</span> You may reschedule (subject to availability)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-red-400 mb-4">2.3 No-Show</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span><span className="text-white font-medium">Refund:</span> No refund under any circumstances</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span>Missing the scheduled time without prior notification is considered a no-show</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical & Emergency */}
                <div id="medical" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        3. Medical & Emergency Cancellations
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>
                        We understand that emergencies happen. For cancellations due to medical 
                        emergencies or accidents:
                      </p>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>A <span className="text-white font-medium">valid medical certificate</span> is required</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>The certificate must be dated and clearly state the condition</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Submit the certificate to support@threemonkeys.com within 7 days</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Refund will be processed minus the 5% processing fee</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation by Us */}
                <div id="by-us" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <RefreshCcw className="w-6 h-6 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        4. Cancellation by Three Monkeys
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>In rare cases, we may need to cancel reservations due to:</p>
                      
                      <div className="grid sm:grid-cols-3 gap-4 my-6">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-2xl mb-2">🌧️</div>
                          <p className="text-sm text-white/60">Severe weather conditions</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-2xl mb-2">⚠️</div>
                          <p className="text-sm text-white/60">Safety concerns</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-2xl mb-2">🔧</div>
                          <p className="text-sm text-white/60">Unforeseen circumstances</p>
                        </div>
                      </div>
                      
                      <p>In such cases, you will receive:</p>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                          <h4 className="text-green-400 font-medium mb-2">Option 1</h4>
                          <p className="text-white/60 text-sm">Full refund (no processing fee deducted)</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <h4 className="text-blue-400 font-medium mb-2">Option 2</h4>
                          <p className="text-white/60 text-sm">Reschedule to another date at no additional cost</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third-Party Bookings */}
                <div id="third-party" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        5. Third-Party Bookings
                      </h2>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white/70 mb-4">
                        If you purchased through a third-party distributor, travel agent, or online travel agency (OTA):
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-white/70">
                          <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>Their cancellation and refund policies apply, not ours</span>
                        </li>
                        <li className="flex items-start gap-3 text-white/70">
                          <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>Please contact the original point of purchase for refund requests</span>
                        </li>
                        <li className="flex items-start gap-3 text-white/70">
                          <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>We cannot process refunds for bookings not made directly through our website</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Partial Refunds */}
                <div id="partial" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                        <Percent className="w-6 h-6 text-teal-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        6. Partial Refunds
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>Partial refunds may be issued in the following situations:</p>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                            <span>Reducing the number of guests (24+ hours notice required)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                            <span>Downgrading to a lower-priced package (24+ hours notice required)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                            <span>Service partially completed due to weather interruption</span>
                          </li>
                        </ul>
                      </div>
                      
                      <p className="text-sm text-white/50">
                        All partial refunds are subject to the 5% processing fee on the refunded amount.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Process */}
                <div id="process" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        7. Refund Process
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">7.1 How to Request a Refund</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#b1b94c]/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#b1b94c] font-medium text-sm">1</span>
                            </div>
                            <div>
                              <p className="text-white font-medium mb-1">Email support@threemonkeys.com with:</p>
                              <ul className="text-white/60 text-sm space-y-1 ml-4">
                                <li>• Your booking reference number</li>
                                <li>• Reason for cancellation</li>
                                <li>• Medical certificate (if applicable)</li>
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#b1b94c]/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#b1b94c] font-medium text-sm">2</span>
                            </div>
                            <p className="text-white/70">You will receive a confirmation email within 24 hours</p>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#b1b94c]/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#b1b94c] font-medium text-sm">3</span>
                            </div>
                            <p className="text-white/70">Approved refunds are processed within 5-10 business days</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">7.2 Refund Method</h3>
                        <p className="text-white/70 mb-4">
                          Refunds are issued to the <span className="text-white font-medium">original payment method</span> used for 
                          the booking. We cannot refund to a different card or payment method.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="w-4 h-4 text-[#b1b94c]" />
                              <span className="text-white font-medium text-sm">Credit/Debit Cards</span>
                            </div>
                            <p className="text-white/60 text-sm">5-10 business days (may vary by bank)</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-[#b1b94c]" />
                              <span className="text-white font-medium text-sm">Statement Display</span>
                            </div>
                            <p className="text-white/60 text-sm">Appears as "ONEBOOKING" or "STRIPE"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Refundable Items */}
                <div id="non-refundable" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        8. Non-Refundable Items
                      </h2>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                      <p className="text-white/70 mb-4">The following are non-refundable:</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          'Photo and video packages (once delivered)',
                          'Merchandise purchases',
                          'Food and beverage purchases',
                          'Special promotional bookings'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-red-400/80">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disputes */}
                <div id="disputes" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-orange-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        9. Disputes
                      </h2>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white/70 mb-4">
                        If you believe your refund request was incorrectly denied or you have not 
                        received your refund within the stated timeframe:
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-orange-400 font-medium text-sm">1</span>
                          </div>
                          <p className="text-white/70">Contact us at support@threemonkeys.com with your booking reference</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-orange-400 font-medium text-sm">2</span>
                          </div>
                          <p className="text-white/70">We will investigate and respond within 3 business days</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-orange-400 font-medium text-sm">3</span>
                          </div>
                          <p className="text-white/70">If the issue remains unresolved, you may contact your bank or card issuer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div id="contact" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#b1b94c]/20 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        10. Contact Information
                      </h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-[#b1b94c]/20 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-[#b1b94c]" />
                          </div>
                          <h3 className="text-lg font-medium text-white">For Refund Requests</h3>
                        </div>
                        <div className="space-y-2 text-white/70">
                          <p>support@threemonkeys.com</p>
                          <p className="text-sm text-white/50">Include your booking reference</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-green-400" />
                          </div>
                          <h3 className="text-lg font-medium text-white">Urgent Inquiries</h3>
                        </div>
                        <div className="space-y-2 text-white/70">
                          <p>+66 98-010-8838</p>
                          <div className="flex items-center gap-2 text-sm text-white/50">
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-white/5 rounded-xl">
                      <p className="text-white/60 text-sm">
                        For payment-related inquiries, you may also contact: 
                        <span className="text-white font-medium"> Chamnanthang Co., Ltd. (ONEBOOKING)</span> at support@onebooking.co
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
                    href="/cookies"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-[#b1b94c]" />
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
