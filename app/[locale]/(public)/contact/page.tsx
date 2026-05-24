'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
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
import { CustomSelect, CountryCodeSelect } from '@/components/ui';
import { useTranslations } from 'next-intl';

const contactMethodsMeta = [
  {
    key: 'call',
    icon: Phone,
    value: '+66 98-010-8838',
    href: 'tel:+66980108838',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    key: 'email',
    icon: Mail,
    value: 'enjoy@threemonkeysphuket.com',
    href: 'mailto:enjoy@threemonkeysphuket.com',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    key: 'whatsapp',
    icon: MessageCircle,
    value: '+66 98-010-8838',
    href: 'https://wa.me/66980108838',
    color: 'from-green-500/20 to-emerald-500/20',
  },
];


export default function ContactPage() {
  const t = useTranslations('contactPage');
  
  const contactMethods = useMemo(() => {
    return contactMethodsMeta.map(m => ({
      ...m,
      title: t(`methods.${m.key}.title`),
      description: t(`methods.${m.key}.description`),
    }));
  }, [t]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [countryCode, setCountryCode] = useState('+66');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    
    try {
      const fullPhone = formData.phone ? `${countryCode} ${formData.phone}` : '';
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSent(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setCountryCode('+66');
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
      <section className="relative min-h-[60vh] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/new/threemonkeys001.jpg"
            alt="Contact Us"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center px-4 pt-32 pb-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#b1b94c]" />
            <span className="text-[#b1b94c] text-sm font-medium">{t('badge')}</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            {t('headline')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            {t('description')}
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
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form - Takes 3 columns */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <div className="bg-[#111] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-white/10">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#b1b94c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 sm:w-6 sm:h-6 text-[#b1b94c]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-[family-name:var(--font-krona)] text-white normal-case">
                      {t('form.title')}
                    </h2>
                    <p className="text-white/40 text-xs sm:text-sm">{t('form.subtitle')}</p>
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
                      <p className="text-green-400 font-medium">{t('form.successTitle')}</p>
                      <p className="text-green-400/70 text-sm mt-1">
                        {t('form.successMessage')}
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
                      <p className="text-red-400 font-medium">{t('form.errorTitle')}</p>
                      <p className="text-red-400/70 text-sm mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        {t('form.nameLabel')} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all text-white placeholder:text-white/30 font-[family-name:var(--font-inter)] text-base"
                        placeholder={t('form.namePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        {t('form.emailLabel')} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all text-white placeholder:text-white/30 font-[family-name:var(--font-inter)] text-base"
                        placeholder={t('form.emailPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        {t('form.phoneLabel')}
                      </label>
                      <div className="flex gap-2">
                        <div className="w-[92px] flex-shrink-0">
                          <CountryCodeSelect
                            value={countryCode}
                            onChange={setCountryCode}
                            placeholder={t('form.codePlaceholder')}
                          />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="min-w-0 flex-1 px-3 sm:px-4 py-3 sm:py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all text-white placeholder:text-white/30 font-[family-name:var(--font-inter)] text-base"
                          placeholder="98 010 8838"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                        {t('form.subjectLabel')} *
                      </label>
                      <CustomSelect
                        value={formData.subject}
                        onChange={(value) => setFormData({ ...formData, subject: value })}
                        placeholder={t('form.subjectPlaceholder')}
                        options={[
                          { value: 'reservation', label: t('form.subjects.reservation') },
                          { value: 'modification', label: t('form.subjects.modification') },
                          { value: 'cancellation', label: t('form.subjects.cancellation') },
                          { value: 'group', label: t('form.subjects.group') },
                          { value: 'event', label: t('form.subjects.event') },
                          { value: 'transfer', label: t('form.subjects.transfer') },
                          { value: 'feedback', label: t('form.subjects.feedback') },
                          { value: 'other', label: t('form.subjects.other') },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2 font-[family-name:var(--font-inter)]">
                      {t('form.messageLabel')} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-[#b1b94c]/50 focus:bg-[#0a0a0a] transition-all resize-none text-white placeholder:text-white/30 font-[family-name:var(--font-inter)] text-base"
                      placeholder={t('form.messagePlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-[#b1b94c] hover:bg-[#c4cc5a] text-black font-[family-name:var(--font-krona)] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('form.sending')}
                      </>
                    ) : (
                      <>
                        {t('form.submit')}
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
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Location Card */}
              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/10">
                <div className="relative h-48">
                  <Image
                    src="/images/small/small-sized_49.jpg"
                    alt="Rainforest Location"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111]/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-[#b1b94c]">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('location.ourLocation')}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-3 normal-case">
                    {t('location.restaurantName')}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 font-[family-name:var(--font-inter)]">
                    {t('location.insideHanuman')}<br />
                    {t('location.address1')}<br />
                    {t('location.address2')}<br />
                    {t('location.country')}
                  </p>
                  <a
                    href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#b1b94c] text-sm font-medium hover:underline"
                  >
                    <Navigation className="w-4 h-4" />
                    {t('location.getDirections')}
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
                    {t('hours.title')}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 font-[family-name:var(--font-inter)]">{t('hours.days')}</span>
                    <span className="text-white font-medium">{t('hours.time')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/60 font-[family-name:var(--font-inter)]">{t('hours.lastOrder')}</span>
                    <span className="text-white font-medium">{t('hours.lastOrderTime')}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[#b1b94c]/10 rounded-xl">
                  <p className="text-[#b1b94c] text-sm font-[family-name:var(--font-inter)]">
                    {t('hours.reservationNote')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/new/threemonkeys028.jpg"
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
              {t('cta.title')}
            </h2>
            <p className="text-white/60 text-lg mb-8 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              {t('cta.description')}
            </p>
            <Link href="/booking">
              <button className="px-10 py-5 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all inline-flex items-center gap-3">
                {t('cta.reserve')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
