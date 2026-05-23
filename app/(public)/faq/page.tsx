'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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

const faqCategories = [
  {
    id: 'booking',
    category: 'Booking & Reservations',
    icon: Calendar,
    color: 'from-blue-500/20 to-cyan-500/20',
    questions: [
      {
        question: 'How do I make a reservation?',
        answer: 'You can book directly through our website by selecting your preferred seat or package, date, and time. Simply click the "Book Now" button, fill in your details, and complete the payment. You will receive a confirmation email immediately after booking. Then just present that when you arrive.',
      },
      {
        question: 'Can I modify or cancel my booking?',
        answer: 'Reservations can be modified or cancelled up to 24 hours before your scheduled time. Please contact our customer service team for assistance. Cancellations made within 24 hours may be subject to a cancellation fee depending on your booking type and package.',
      },
      {
        question: 'How far in advance should I book?',
        answer: 'We recommend booking at least 2–3 days in advance, especially for weekends and special occasions. For popular zones such as Monkey Dome and Monkey Nest, booking 1 week in advance is highly recommended.',
      },
      {
        question: 'Can we walk in without a reservation?',
        answer: 'Walk-in guests are welcome. However, as the restaurant is usually busy, we highly recommend making a reservation in advance with a deposit to guarantee your table. Walk-in guests may need to wait depending on table availability.',
      },
    ],
  },
  {
    id: 'dining',
    category: 'Dining & Menu',
    icon: Utensils,
    color: 'from-orange-500/20 to-red-500/20',
    questions: [
      {
        question: 'Do you accommodate dietary restrictions?',
        answer: 'Yes. We offer Halal-friendly, Vegetarian, and some allergy-friendly menu options. Please inform us in advance so our chefs can prepare accordingly.',
      },
      {
        question: 'What type of cuisine do you serve?',
        answer: 'We specialize in authentic Southern Thai cuisine with modern presentation using fresh locally sourced ingredients and premium seafood.',
      },
      {
        question: 'Do you have a dress code?',
        answer: 'We recommend smart casual attire. While we want guests to feel comfortable, beachwear, flip-flops, and sleeveless shirts for men are not recommended during evening service.',
      },
      {
        question: 'Can children dine at the restaurant?',
        answer: 'Absolutely. Families and children are welcome. We also provide menu options suitable for younger guests.',
      },
    ],
  },
  {
    id: 'experience',
    category: 'The Experience',
    icon: Sparkles,
    color: 'from-purple-500/20 to-pink-500/20',
    questions: [
      {
        question: 'How long does the dining experience take?',
        answer: 'Most dining experiences take approximately 2–3 hours depending on your package and dining style. We recommend arriving 15 minutes before your reservation time.',
      },
      {
        question: 'Can I request a specific seat or zone?',
        answer: 'Yes. Guests can select their preferred dining zone during booking, subject to availability. Each zone offers a unique atmosphere and dining experience.',
      },
      {
        question: 'Can I host a private event or celebration?',
        answer: 'Yes. We offer special packages for birthdays, anniversaries, proposals, honeymoon dinners, and private events. We can also assist with decorations and special arrangements depending on your request.',
      },
      {
        question: 'Do you have live entertainment?',
        answer: 'Yes. We offer live entertainment throughout the day, including Live Band, DJ, Bongo, and Fire Show. The schedule may change depending on weather conditions, operation requirements, or special events.',
      },
    ],
  },
  {
    id: 'pricing',
    category: 'Packages & Pricing',
    icon: CreditCard,
    color: 'from-green-500/20 to-emerald-500/20',
    questions: [
      {
        question: 'Is the deposit refundable?',
        answer: 'The deposit can be fully redeemed for food and beverages on the day of your visit and is considered the minimum spending for your table. If your spending is lower than the deposit amount, the remaining balance is non-refundable. If your spending exceeds the deposit amount, additional payment will be required based on the final bill.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards, Google Pay, and cash payments at the restaurant. Payments are processed in Thai Baht.',
      },
      {
        question: 'Do you offer gift vouchers?',
        answer: 'Yes. Gift vouchers are available for selected dining packages and are valid for 6 months from the purchase date.',
      },
      {
        question: 'Do you have semi-private or private areas?',
        answer: 'Yes. We have some semi-private seating areas with limited capacity. For exclusive zones, private functions, group events, or special celebrations, please contact us directly via phone or WhatsApp at 098-010-8838 to check availability, conditions, and additional charges depending on the selected zone.',
      },
    ],
  },
  {
    id: 'location',
    category: 'Location & Access',
    icon: MapPin,
    color: 'from-amber-500/20 to-yellow-500/20',
    questions: [
      {
        question: 'Where is Three Monkeys located?',
        answer: 'Three Monkeys is located inside Hanuman World Phuket at 105 Moo 4, Muang Chao Fa Rd., Wichit, Mueang Phuket, Phuket 83000.',
      },
      {
        question: 'Is parking available?',
        answer: 'Yes. Free parking is available at Hanuman World for all restaurant guests.',
      },
      {
        question: 'Do you offer hotel transfers?',
        answer: 'Yes. We offer a private round-trip van transfer service within Phuket area, excluding airport pick-up, with a maximum capacity of 10 guests per van. Additional transfer charges may apply, and advance booking is recommended.',
      },
      {
        question: 'What are your opening hours?',
        answer: 'We are open daily from 10:00 AM – 1:00 AM. Last order is at 12:00 AM (midnight). We recommend arriving before 11:00 PM to fully enjoy our dining experience.',
      },
    ],
  },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

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
  }, [searchTerm, activeCategory]);

  const allFAQs = useMemo(() => 
    faqCategories.flatMap(cat => cat.questions),
    []
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
            <span className="text-[#b1b94c] text-sm font-medium">Help Center</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            How Can We Help?
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg mb-10 font-[family-name:var(--font-inter)]"
          >
            Find answers to {totalQuestions}+ frequently asked questions about Three Monkeys
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
              placeholder="Search for answers..."
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
                  {cat.questions.length} questions
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
                No questions found matching &quot;{searchTerm}&quot;
              </p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory(null); }}
                className="mt-4 text-[#b1b94c] hover:underline"
              >
                Clear search
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
              Need More Help?
            </h2>
            <p className="text-white/50 font-[family-name:var(--font-inter)]">
              Our team is ready to assist you
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
                Call Us
              </h3>
              <p className="text-[#b1b94c] font-medium">+66 98-010-8838</p>
              <p className="text-white/40 text-sm mt-2">Daily 10:00 AM – 1:00 AM</p>
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
                Email Us
              </h3>
              <p className="text-[#b1b94c] font-medium">enjoy@threemonkeysphuket.com</p>
              <p className="text-white/40 text-sm mt-2">We reply within 24 hours</p>
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
                Visit Us
              </h3>
              <p className="text-white/60 text-sm">Inside Hanuman World</p>
              <p className="text-white/40 text-sm mt-2">Wichit, Phuket 83000</p>
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
              Ready to Experience Three Monkeys?
            </h2>
            <p className="text-black/60 text-lg mb-8 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              Book your table now and discover the magic of jungle dining in Phuket
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <button className="px-8 py-4 bg-black text-[#b1b94c] font-[family-name:var(--font-krona)] rounded-full hover:bg-black/80 transition-all inline-flex items-center gap-2">
                  Reserve Your Table
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-transparent border-2 border-black text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-black hover:text-[#b1b94c] transition-all">
                  Contact Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
