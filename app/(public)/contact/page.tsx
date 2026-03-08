'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Navigation,
  Sparkles
} from 'lucide-react';

const contactMethods = [
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak directly with our team',
    value: '+66 76 323 264',
    href: 'tel:+6676323264',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Mail,
    title: 'Email Us',
    description: 'We reply within 24 hours',
    value: 'info@threemonkeysphuket.com',
    href: 'mailto:info@threemonkeysphuket.com',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Chat with us instantly',
    value: '+66 76 323 264',
    href: 'https://wa.me/6676323264',
    color: 'from-green-500/20 to-emerald-500/20',
  },
];


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSent(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 10000);
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/46_resize.jpg"
            alt="Contact Us"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center px-4 py-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#b1b94c]" />
            <span className="text-[#b1b94c] text-sm font-medium">We&apos;d Love to Hear From You</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            Get in Touch
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            Have questions about reservations, special events, or just want to say hello? 
            Our team is here to help make your experience unforgettable.
          </motion.p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.title}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 bg-[#111] rounded-3xl border border-white/10 hover:border-[#b1b94c]/50 transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="w-14 h-14 bg-[#b1b94c]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#b1b94c]/20 transition-colors">
                    <method.icon className="w-7 h-7 text-[#b1b94c]" />
                  </div>
                  <h3 className="text-xl font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                    {method.title}
                  </h3>
                  <p className="text-white/40 text-sm mb-3 font-[family-name:var(--font-inter)]">
                    {method.description}
                  </p>
                  <p className="text-[#b1b94c] font-medium group-hover:underline">
                    {method.value}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form - Takes 3 columns */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="bg-[#111] rounded-3xl p-8 md:p-10 border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-[#b1b94c]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white normal-case">
                      Send a Message
                    </h2>
                    <p className="text-white/40 text-sm">We&apos;ll respond within 24 hours</p>
                  </div>
                </div>

                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-5 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-green-400 font-medium">Message sent successfully!</p>
                      <p className="text-green-400/70 text-sm mt-1">
                        Thank you for reaching out. Our team will get back to you within 24-48 hours.
                      </p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-400 font-medium">Failed to send message</p>
                      <p className="text-red-400/70 text-sm mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all text-white placeholder:text-white/30 font-[family-name:var(--font-inter)]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all text-white placeholder:text-white/30 font-[family-name:var(--font-inter)]"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all text-white placeholder:text-white/30 font-[family-name:var(--font-inter)]"
                        placeholder="+66 XX XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 transition-all text-white font-[family-name:var(--font-inter)]"
                      >
                        <option value="">Select a topic</option>
                        <option value="reservation">Reservation Inquiry</option>
                        <option value="modification">Booking Modification</option>
                        <option value="cancellation">Cancellation Request</option>
                        <option value="group">Group Booking (10+)</option>
                        <option value="event">Special Event / Celebration</option>
                        <option value="transfer">VVIP Transfer Service</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all resize-none text-white placeholder:text-white/30 font-[family-name:var(--font-inter)]"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-[family-name:var(--font-krona)] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Sidebar - Takes 2 columns */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Location Card */}
              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/10">
                <div className="relative h-48">
                  <Image
                    src="/images/Random images/47_resize.jpg"
                    alt="Rainforest Location"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-[#b1b94c]">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Our Location</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-3 normal-case">
                    Three Monkeys Restaurant
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 font-[family-name:var(--font-inter)]">
                    Inside Hanuman World<br />
                    105 Moo 4, Soi Namtok Kathu<br />
                    Wichit, Muang, Phuket 83120<br />
                    Thailand
                  </p>
                  <a
                    href="https://maps.google.com/?q=Three+Monkeys+Restaurant+Phuket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#b1b94c] text-sm font-medium hover:underline"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Hours Card */}
              <div className="bg-[#111] rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#b1b94c]/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#b1b94c]" />
                  </div>
                  <h3 className="text-lg font-[family-name:var(--font-krona)] text-white normal-case">
                    Opening Hours
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 font-[family-name:var(--font-inter)]">Monday - Sunday</span>
                    <span className="text-white font-medium">11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/60 font-[family-name:var(--font-inter)]">Last Seating</span>
                    <span className="text-white font-medium">8:30 PM</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[#b1b94c]/10 rounded-xl">
                  <p className="text-[#b1b94c] text-sm font-[family-name:var(--font-inter)]">
                    Reservations recommended for dinner service
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
              Find Us in the Rainforest
            </h2>
            <p className="text-white/50 font-[family-name:var(--font-inter)]">
              Located inside Hanuman World, Kathu, Phuket
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden border border-white/10 h-[400px]"
          >
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=98.30%2C7.92%2C98.32%2C7.94&layer=mapnik&marker=7.93%2C98.31"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Three Monkeys Location"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/48_resize.jpg"
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
              Ready to Dine in the Rainforest?
            </h2>
            <p className="text-white/60 text-lg mb-8 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              Skip the wait and book your table online. Experience authentic Thai cuisine in a magical jungle setting.
            </p>
            <Link href="/booking">
              <button className="px-10 py-5 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all inline-flex items-center gap-3">
                Reserve Your Table
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
