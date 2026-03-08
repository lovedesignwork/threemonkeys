'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  Clock, 
  Car, 
  Users, 
  Utensils, 
  Camera, 
  Shield, 
  Scale,
  ChevronRight,
  ArrowUp,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: FileText },
  { id: 'booking', title: 'Booking & Reservations', icon: Calendar },
  { id: 'cancellation', title: 'Cancellation Policy', icon: Clock },
  { id: 'transfer', title: 'Transfer & Transportation', icon: Car },
  { id: 'requirements', title: 'Reservation Requirements', icon: Users },
  { id: 'food-safety', title: 'Food Safety & Liability', icon: Utensils },
  { id: 'arrival', title: 'Arrival & Check-In', icon: Clock },
  { id: 'conduct', title: 'Code of Conduct', icon: Shield },
  { id: 'photography', title: 'Photography & Media', icon: Camera },
  { id: 'legal', title: 'Legal Terms', icon: Scale },
  { id: 'contact', title: 'Contact Information', icon: Mail },
];

export default function TermsPage() {
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
            src="/images/Random images/42_resize.jpg"
            alt="Legal document"
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
              <FileText className="w-4 h-4 text-[#b1b94c]" />
              <span className="text-sm text-white/80">Legal Documentation</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-krona)] text-white mb-6">
              Terms & Conditions
            </h1>
            
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-4">
              Please read these terms carefully before making a reservation at Three Monkeys Restaurant
            </p>
            
            <p className="text-sm text-white/40">
              Last updated: February 2026
            </p>
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
                        <FileText className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        1. Introduction
                      </h2>
                    </div>
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <p>
                        Welcome to Three Monkeys, operated by <span className="text-white font-medium">SKY WORLD ADVENTURES Co., Ltd.</span> 
                        These Terms and Conditions govern your use of our website, services, and dining experiences. 
                        By making a booking or visiting our restaurant, you agree to be bound by these terms.
                      </p>
                      <p>
                        Online bookings and payments are processed by <span className="text-white font-medium">Chamnanthang Co., Ltd.</span> 
                        (operating as "ONEBOOKING"). Your credit card statement will display the payment as "ONEBOOKING".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking & Reservations */}
                <div id="booking" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        2. Booking & Reservations
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">2.1 Making a Booking</h3>
                        <p className="text-white/70 leading-relaxed">
                          All bookings are subject to availability. When you make a booking, you will receive a 
                          confirmation email with your booking reference number. Please keep this for your records 
                          and present it upon arrival.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">2.2 Payment</h3>
                        <p className="text-white/70 leading-relaxed">
                          Full payment is required at the time of booking. We accept major credit cards through 
                          our secure payment partner, Stripe. All prices are displayed in Thai Baht (THB) and 
                          include applicable taxes.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">2.3 Confirmation</h3>
                        <p className="text-white/70 leading-relaxed">
                          Your booking is confirmed once payment is successfully processed and you receive a 
                          confirmation email. The credit card statement will display the payment as "ONEBOOKING" 
                          (Chamnanthang Co., Ltd.).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div id="cancellation" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        3. Cancellation Policy
                      </h2>
                    </div>
                    
                    {/* Quick Summary Cards */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                          <Clock className="w-5 h-5 text-green-400" />
                        </div>
                        <h4 className="font-medium text-green-400 mb-1">24+ Hours</h4>
                        <p className="text-sm text-green-400/70">Full refund (5% fee)</p>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                          <FileText className="w-5 h-5 text-amber-400" />
                        </div>
                        <h4 className="font-medium text-amber-400 mb-1">Medical</h4>
                        <p className="text-sm text-amber-400/70">With certificate</p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-3">
                          <Clock className="w-5 h-5 text-red-400" />
                        </div>
                        <h4 className="font-medium text-red-400 mb-1">&lt;24 Hours</h4>
                        <p className="text-sm text-red-400/70">No refund</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">3.1 Standard Cancellations</h3>
                        <p>
                          Cancellations are accepted if made at least <span className="text-white font-medium">24 hours</span> before 
                          the scheduled reservation. A <span className="text-white font-medium">5% processing fee</span> will be deducted 
                          from the total amount paid for all cancellations and partial refunds.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">3.2 Less Than 24 Hours</h3>
                        <p>
                          Cancellations made less than 24 hours before the scheduled reservation will 
                          <span className="text-red-400 font-medium"> not be eligible for a refund</span>.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">3.3 Medical Cancellations</h3>
                        <p>
                          For cancellations due to medical emergencies, a <span className="text-white font-medium">valid medical 
                          certificate is required</span>. With proper documentation, you will receive a full refund minus 
                          the 5% processing fee.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">3.4 No-Show Policy</h3>
                        <p>
                          If you miss the scheduled reservation time without prior notification, or if you are a no-show, 
                          <span className="text-red-400 font-medium"> no refund will be issued under any circumstances</span>.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">3.5 Cancellation by Three Monkeys</h3>
                        <p>
                          We reserve the right to cancel reservations due to severe weather conditions, safety concerns, 
                          or unforeseen circumstances. In such cases, you will receive a full refund or the option to 
                          reschedule to another date at no additional cost.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer & Transportation */}
                <div id="transfer" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Car className="w-6 h-6 text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        4. Transfer & Transportation
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">4.1 VVIP Transfer Service</h3>
                        <p className="mb-4">
                          We offer premium VVIP transfer services from selected areas in Phuket. This service 
                          includes pickup and drop-off at your hotel or designated location.
                        </p>
                        <div className="bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-xl p-4">
                          <p className="text-[#b1b94c] font-medium">VVIP Transfer: ฿1,500 per booking</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">4.2 Out-of-Zone Locations</h3>
                        <p className="mb-3">
                          Locations <span className="text-white font-medium">outside our standard transfer zone</span> include:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {['Ao Por', 'Baan Dorn', 'Bangjo', 'Layan Beach', 'Maikhao Beach', 'Naithon Beach', 'Naiyang Beach', 'Pasak'].map((location) => (
                            <div key={location} className="bg-white/5 rounded-lg px-3 py-2 text-sm text-white/60">
                              {location}
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-sm">Additional fees may apply for these locations.</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">4.3 Airport Transfers</h3>
                        <p>
                          We <span className="text-white font-medium">do not provide airport pick-up</span> due to fixed 
                          reservation times and flight unpredictability. Airport drop-off is available; please include 
                          your flight time in the booking notes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reservation Requirements */}
                <div id="requirements" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        5. Reservation Requirements
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">5.1 Guest Requirements</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Children under 12 must be accompanied by an adult</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Please inform us of any food allergies or dietary restrictions</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">5.2 Special Dietary Needs</h3>
                        <p className="mb-3">Please inform us in advance if you have:</p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Food allergies (nuts, shellfish, gluten, etc.)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Dietary restrictions (vegetarian, vegan, halal, etc.)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Medical dietary requirements</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Pregnancy (for certain dishes)</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">5.3 Dress Code</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Smart casual attire is recommended for dinner service</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Resort casual is acceptable for lunch</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>No beachwear or swimwear</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                            <span>Sleeveless shirts for men are not permitted during dinner</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Food Safety & Liability */}
                <div id="food-safety" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-orange-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        6. Food Safety & Liability
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">6.1 Allergen Information</h3>
                        <p>
                          Our kitchen handles common allergens. While we take precautions, we cannot guarantee 
                          a completely allergen-free environment. By dining with us, you acknowledge this limitation.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">6.2 Food Safety Standards</h3>
                        <p>
                          Our kitchen follows strict hygiene and food safety protocols. All staff are trained 
                          in food handling and safety procedures.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">6.3 Liability</h3>
                        <p>
                          Three Monkeys Restaurant takes every precaution to ensure food safety. However, 
                          guests with severe allergies should inform staff before ordering.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrival & Check-In */}
                <div id="arrival" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-teal-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        7. Arrival & Check-In
                      </h2>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <ul className="space-y-3 text-white/70">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>Please arrive at least <span className="text-white font-medium">15 minutes before</span> your reservation time</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>Reservations will be held for 15 minutes after the scheduled time</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>Late arrivals may result in reduced dining time or table reassignment</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Code of Conduct */}
                <div id="conduct" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        8. Code of Conduct
                      </h2>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white/70 mb-4">Guests must:</p>
                      <ul className="space-y-3 text-white/70">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>Respect other guests and staff</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>Not engage in disruptive or inappropriate behavior</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>Follow the dress code for the dining area</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#b1b94c] flex-shrink-0 mt-0.5" />
                          <span>Supervise children at all times</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm">
                          Violation of the code of conduct may result in being asked to leave without refund.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photography & Media */}
                <div id="photography" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-pink-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        9. Photography & Media
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <p>
                          Three Monkeys may photograph food and dining areas for promotional purposes. 
                          Guests may be included in background shots. Please inform us if you prefer 
                          not to be photographed.
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-6">
                        <p>
                          Personal photography of food is welcome. Please be considerate of other 
                          guests when using flash or professional equipment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Terms */}
                <div id="legal" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-500/20 flex items-center justify-center">
                        <Scale className="w-6 h-6 text-slate-400" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        10. Legal Terms
                      </h2>
                    </div>
                    
                    <div className="space-y-4 text-white/70 leading-relaxed">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">Intellectual Property</h3>
                        <p>
                          All content on this website, including text, images, logos, and designs, is 
                          the property of SKY WORLD ADVENTURES Co., Ltd. and is protected by copyright 
                          and trademark laws. Unauthorized use is prohibited.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">Limitation of Liability</h3>
                        <p>
                          To the maximum extent permitted by law, SKY WORLD ADVENTURES Co., Ltd. and 
                          Chamnanthang Co., Ltd. shall not be liable for any indirect, incidental, 
                          special, consequential, or punitive damages arising from your use of our 
                          services.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">Changes to Terms</h3>
                        <p>
                          We reserve the right to modify these terms at any time. Changes will be 
                          effective immediately upon posting to our website. Continued use of our 
                          services constitutes acceptance of the modified terms.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">Governing Law</h3>
                        <p>
                          These terms are governed by the laws of the Kingdom of Thailand. Any disputes 
                          arising from these terms shall be subject to the exclusive jurisdiction of 
                          the courts of Phuket, Thailand.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div id="contact" className="scroll-mt-32">
                  <div className="bg-[#111] rounded-3xl border border-white/10 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#b1b94c]/20 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-[#b1b94c]" />
                      </div>
                      <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white">
                        11. Contact Information
                      </h2>
                    </div>
                    
                    <p className="text-white/70 mb-6">
                      For questions about these terms, please contact us:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">SKY WORLD ADVENTURES Co., Ltd.</h3>
                        <p className="text-sm text-white/40 mb-4">(Three Monkeys)</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <Mail className="w-4 h-4 text-[#b1b94c]" />
                            <span>info@threemonkeys.com</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <Phone className="w-4 h-4 text-[#b1b94c]" />
                            <span>+66 76 323 264</span>
                          </div>
                          <div className="flex items-start gap-3 text-white/70">
                            <MapPin className="w-4 h-4 text-[#b1b94c] flex-shrink-0 mt-1" />
                            <span>89/16 Moo 6, Soi Namtok Kathu, Kathu, Phuket 83120, Thailand</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Chamnanthang Co., Ltd.</h3>
                        <p className="text-sm text-white/40 mb-4">(ONEBOOKING - Payment Inquiries)</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <Mail className="w-4 h-4 text-[#b1b94c]" />
                            <span>support@onebooking.co</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <FileText className="w-4 h-4 text-[#b1b94c]" />
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
                    <CreditCard className="w-5 h-5 text-[#b1b94c]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Refund Policy</span>
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
