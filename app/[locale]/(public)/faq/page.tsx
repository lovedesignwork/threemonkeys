'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { 
  ChevronDown, 
  Search, 
  MessageCircle, 
  ArrowRight,
  Calendar,
  Utensils,
  Sparkles,
  CreditCard,
  MapPin,
  Clock,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { FAQSchema } from '@/lib/seo/structured-data';
import { useTranslations } from 'next-intl';

const categoryMeta = [
  { id: 'booking', icon: Calendar, color: 'from-blue-500/20 to-cyan-500/20', questionCount: 4 },
  { id: 'dining', icon: Utensils, color: 'from-orange-500/20 to-red-500/20', questionCount: 4 },
  { id: 'experience', icon: Sparkles, color: 'from-purple-500/20 to-pink-500/20', questionCount: 4 },
  { id: 'pricing', icon: CreditCard, color: 'from-green-500/20 to-emerald-500/20', questionCount: 4 },
  { id: 'location', icon: MapPin, color: 'from-amber-500/20 to-yellow-500/20', questionCount: 4 },
];

function FAQItem({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-start justify-between py-5 text-left group"
      >
        <span className="font-medium text-white pr-4 group-hover:text-[#b1b94c] transition-colors font-[family-name:var(--font-inter)]">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 transition-all ${isOpen ? 'bg-[#b1b94c] rotate-180' : ''}`}>
          <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-black' : 'text-[#b1b94c]'}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-white/60 leading-relaxed font-[family-name:var(--font-inter)]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations('faqPage');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const faqCategories = useMemo(() => {
    return categoryMeta.map(cat => ({
      ...cat,
      category: t(`categories.${cat.id}.name`),
      questions: Array.from({ length: cat.questionCount }, (_, i) => ({
        question: t(`categories.${cat.id}.questions.${i}.q`),
        answer: t(`categories.${cat.id}.questions.${i}.a`),
      })),
    }));
  }, [t]);

  const filteredCategories = useMemo(() => {
    return faqCategories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter(
        (cat) =>
          cat.questions.length > 0 &&
          (activeCategory === null || cat.id === activeCategory)
      );
  }, [searchTerm, activeCategory, faqCategories]);

  const allFAQs = useMemo(() => 
    faqCategories.flatMap(cat => cat.questions),
    [faqCategories]
  );

  const totalQuestions = faqCategories.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <FAQSchema faqs={allFAQs} />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/new/threemonkeys022.jpg"
            alt="FAQ"
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
            <HelpCircle className="w-4 h-4 text-[#b1b94c]" />
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
            className="text-white/60 text-lg mb-10 font-[family-name:var(--font-inter)]"
          >
            {t('description', { count: totalQuestions })}
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-14 pr-6 py-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#b1b94c]/50 focus:bg-white/10 transition-all font-[family-name:var(--font-inter)]"
            />
          </motion.div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {faqCategories.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`relative p-6 rounded-2xl border transition-all text-center group ${
                  activeCategory === cat.id
                    ? 'bg-[#b1b94c] border-[#b1b94c]'
                    : 'bg-[#111] border-white/10 hover:border-[#b1b94c]/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${
                  activeCategory === cat.id ? 'bg-black/20' : 'bg-white/5 group-hover:bg-[#b1b94c]/10'
                }`}>
                  <cat.icon className={`w-6 h-6 transition-colors ${
                    activeCategory === cat.id ? 'text-black' : 'text-[#b1b94c]'
                  }`} />
                </div>
                <h3 className={`text-sm font-medium transition-colors ${
                  activeCategory === cat.id ? 'text-black' : 'text-white'
                }`}>
                  {cat.category}
                </h3>
                <p className={`text-xs mt-1 transition-colors ${
                  activeCategory === cat.id ? 'text-black/60' : 'text-white/40'
                }`}>
                  {t('questionCount', { count: cat.questions.length })}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60 text-lg font-[family-name:var(--font-inter)]">
                {t('noResults', { term: searchTerm })}
              </p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory(null); }}
                className="mt-4 text-[#b1b94c] hover:underline"
              >
                {t('clearSearch')}
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category, catIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <category.icon className="w-5 h-5 text-[#b1b94c]" />
                    </div>
                    <h2 className="text-xl font-[family-name:var(--font-krona)] text-white normal-case">
                      {category.category}
                    </h2>
                  </div>

                  {/* Questions */}
                  <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6">
                      {category.questions.map((item, qIndex) => (
                        <FAQItem
                          key={`${category.id}-${qIndex}`}
                          question={item.question}
                          answer={item.answer}
                          isOpen={openQuestion === `${category.id}-${qIndex}`}
                          onClick={() => setOpenQuestion(
                            openQuestion === `${category.id}-${qIndex}` ? null : `${category.id}-${qIndex}`
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-16 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-[family-name:var(--font-krona)] text-white mb-4 normal-case">
              {t('contactTitle')}
            </h2>
            <p className="text-white/50 font-[family-name:var(--font-inter)]">
              {t('contactDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Phone */}
            <motion.a
              href="tel:+66980108838"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group p-8 bg-[#0a0a0a] rounded-2xl border border-white/10 hover:border-[#b1b94c]/50 transition-all text-center"
            >
              <div className="w-14 h-14 bg-[#b1b94c]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#b1b94c]/20 transition-colors">
                <Phone className="w-7 h-7 text-[#b1b94c]" />
              </div>
              <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                {t('callUs')}
              </h3>
              <p className="text-[#b1b94c] font-medium">+66 98-010-8838</p>
              <p className="text-white/40 text-sm mt-2">{t('callHours')}</p>
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:enjoy@threemonkeysphuket.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group p-8 bg-[#0a0a0a] rounded-2xl border border-white/10 hover:border-[#b1b94c]/50 transition-all text-center"
            >
              <div className="w-14 h-14 bg-[#b1b94c]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#b1b94c]/20 transition-colors">
                <Mail className="w-7 h-7 text-[#b1b94c]" />
              </div>
              <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                {t('emailUs')}
              </h3>
              <p className="text-[#b1b94c] font-medium">enjoy@threemonkeysphuket.com</p>
              <p className="text-white/40 text-sm mt-2">{t('emailReply')}</p>
            </motion.a>

            {/* Live Chat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group p-8 bg-[#0a0a0a] rounded-2xl border border-white/10 hover:border-[#b1b94c]/50 transition-all text-center"
            >
              <div className="w-14 h-14 bg-[#b1b94c]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#b1b94c]/20 transition-colors">
                <MessageCircle className="w-7 h-7 text-[#b1b94c]" />
              </div>
              <h3 className="text-lg font-[family-name:var(--font-krona)] text-white mb-2 normal-case">
                {t('visitUs')}
              </h3>
              <p className="text-white/60 text-sm">{t('visitLocation')}</p>
              <p className="text-white/40 text-sm mt-2">{t('visitAddress')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/33_resize.jpg"
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#b1b94c]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Clock className="w-12 h-12 text-black mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-black mb-4 normal-case">
              {t('ctaTitle')}
            </h2>
            <p className="text-black/60 text-lg mb-8 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <button className="px-8 py-4 bg-black text-[#b1b94c] font-[family-name:var(--font-krona)] rounded-full hover:bg-black/80 transition-all inline-flex items-center gap-2">
                  {t('ctaReserve')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-transparent border-2 border-black text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-black hover:text-[#b1b94c] transition-all">
                  {t('ctaContact')}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
