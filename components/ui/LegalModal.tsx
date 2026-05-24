'use client';

import { useEffect } from 'react';
import { X, FileText, Shield, Clock, CreditCard, Users, Car, Scale, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms_conditions' | 'privacy_policy';
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const t = useTranslations('legalModal');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="relative bg-[#111] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#b1b94c] to-[#8a9139] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {type === 'terms_conditions' ? (
                  <FileText className="w-5 h-5 text-black" />
                ) : (
                  <Shield className="w-5 h-5 text-black" />
                )}
                <h2 className="text-lg font-[family-name:var(--font-krona)] text-black normal-case">
                  {type === 'terms_conditions' ? t('termsTitle') : t('privacyTitle')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {type === 'terms_conditions' ? (
                <TermsContent t={t} />
              ) : (
                <PrivacyContent t={t} />
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#111] border-t border-white/10 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#b1b94c] text-black rounded-xl hover:bg-[#c4cc5a] transition-colors font-medium"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TermsContent({ t }: { t: ReturnType<typeof useTranslations<'legalModal'>> }) {
  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Section
        icon={FileText}
        iconColor="text-[#b1b94c]"
        bgColor="bg-[#b1b94c]/20"
        title={t('terms.introTitle')}
      >
        <p className="text-white/70 leading-relaxed">
          {t('terms.introText')}
        </p>
      </Section>

      {/* Booking & Payment */}
      <Section
        icon={CreditCard}
        iconColor="text-blue-400"
        bgColor="bg-blue-500/20"
        title={t('terms.bookingTitle')}
      >
        <div className="space-y-3">
          <BulletPoint text={t('terms.booking1')} />
          <BulletPoint text={t('terms.booking2')} />
          <BulletPoint text={t('terms.booking3')} />
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-sm">{t('terms.bookingNote')}</p>
          </div>
        </div>
      </Section>

      {/* Cancellation Policy */}
      <Section
        icon={Clock}
        iconColor="text-amber-400"
        bgColor="bg-amber-500/20"
        title={t('terms.cancellationTitle')}
      >
        <div className="space-y-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-medium">{t('terms.cancellation1')}</p>
          </div>
          <BulletPoint text={t('terms.cancellation2')} />
          <BulletPoint text={t('terms.cancellation3')} />
          <BulletPoint text={t('terms.cancellation4')} />
          <div className="p-3 bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-xl">
            <p className="text-[#b1b94c] text-sm">{t('terms.cancellation5')}</p>
          </div>
        </div>
      </Section>

      {/* Transfer */}
      <Section
        icon={Car}
        iconColor="text-purple-400"
        bgColor="bg-purple-500/20"
        title={t('terms.transferTitle')}
      >
        <div className="space-y-3">
          <BulletPoint text={t('terms.transfer1')} />
          <BulletPoint text={t('terms.transfer2')} />
          <BulletPoint text={t('terms.transfer3')} />
        </div>
      </Section>

      {/* Requirements */}
      <Section
        icon={Users}
        iconColor="text-cyan-400"
        bgColor="bg-cyan-500/20"
        title={t('terms.requirementsTitle')}
      >
        <div className="space-y-3">
          <BulletPoint text={t('terms.requirements1')} />
          <BulletPoint text={t('terms.requirements2')} />
          <BulletPoint text={t('terms.requirements3')} />
          <div className="p-3 bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-xl">
            <p className="text-[#b1b94c] text-sm">{t('terms.requirementsNote')}</p>
          </div>
        </div>
      </Section>

      {/* Legal */}
      <Section
        icon={Scale}
        iconColor="text-slate-400"
        bgColor="bg-slate-500/20"
        title={t('terms.legalTitle')}
      >
        <p className="text-white/70 leading-relaxed text-sm">
          {t('terms.legalText')}
        </p>
      </Section>
    </div>
  );
}

function PrivacyContent({ t }: { t: ReturnType<typeof useTranslations<'legalModal'>> }) {
  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Section
        icon={Shield}
        iconColor="text-[#b1b94c]"
        bgColor="bg-[#b1b94c]/20"
        title={t('privacy.introTitle')}
      >
        <p className="text-white/70 leading-relaxed">
          {t('privacy.introText')}
        </p>
      </Section>

      {/* Data Collection */}
      <Section
        icon={FileText}
        iconColor="text-blue-400"
        bgColor="bg-blue-500/20"
        title={t('privacy.collectionTitle')}
      >
        <div className="space-y-3">
          <BulletPoint text={t('privacy.collection1')} />
          <BulletPoint text={t('privacy.collection2')} />
          <BulletPoint text={t('privacy.collection3')} />
          <BulletPoint text={t('privacy.collection4')} />
        </div>
      </Section>

      {/* Data Usage */}
      <Section
        icon={Users}
        iconColor="text-purple-400"
        bgColor="bg-purple-500/20"
        title={t('privacy.usageTitle')}
      >
        <div className="space-y-3">
          <BulletPoint text={t('privacy.usage1')} />
          <BulletPoint text={t('privacy.usage2')} />
          <BulletPoint text={t('privacy.usage3')} />
          <BulletPoint text={t('privacy.usage4')} />
        </div>
      </Section>

      {/* Data Security */}
      <Section
        icon={Shield}
        iconColor="text-green-400"
        bgColor="bg-green-500/20"
        title={t('privacy.securityTitle')}
      >
        <div className="space-y-3">
          <BulletPoint text={t('privacy.security1')} />
          <BulletPoint text={t('privacy.security2')} />
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 text-sm">{t('privacy.securityNote')}</p>
          </div>
        </div>
      </Section>

      {/* Your Rights */}
      <Section
        icon={Scale}
        iconColor="text-amber-400"
        bgColor="bg-amber-500/20"
        title={t('privacy.rightsTitle')}
      >
        <div className="space-y-3">
          <BulletPoint text={t('privacy.rights1')} />
          <BulletPoint text={t('privacy.rights2')} />
          <BulletPoint text={t('privacy.rights3')} />
          <BulletPoint text={t('privacy.rights4')} />
        </div>
      </Section>

      {/* Contact */}
      <Section
        icon={FileText}
        iconColor="text-slate-400"
        bgColor="bg-slate-500/20"
        title={t('privacy.contactTitle')}
      >
        <p className="text-white/70 leading-relaxed text-sm">
          {t('privacy.contactText')}
        </p>
        <div className="mt-3 p-3 bg-white/5 rounded-xl">
          <p className="text-white/80 text-sm">enjoy@threemonkeysphuket.com</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ 
  icon: Icon, 
  iconColor, 
  bgColor, 
  title, 
  children 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="text-base font-medium text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <ChevronRight className="w-4 h-4 text-[#b1b94c] flex-shrink-0 mt-0.5" />
      <span className="text-white/70 text-sm leading-relaxed">{text}</span>
    </div>
  );
}
