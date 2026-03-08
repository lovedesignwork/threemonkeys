'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { LegalModal } from '@/components/ui/LegalModal';

interface CardPaymentFormProps {
  amount: number;
  bookingRef: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function CardPaymentForm({ 
  amount, 
  bookingRef, 
  onSuccess, 
  onError 
}: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?booking_ref=${bookingRef}`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else {
        setErrorMessage('An unexpected error occurred.');
        onError('An unexpected error occurred.');
      }
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Terms & Conditions */}
      <div className="space-y-3 mb-[30px]">
        <label className="flex items-start gap-4 cursor-pointer">
          <div className="flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-7 h-7 rounded-full border-2 border-slate-300 checked:bg-green-500 checked:border-green-500 focus:ring-green-500 focus:ring-2 appearance-none cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-white after:font-bold after:opacity-0 checked:after:opacity-100"
              style={{ minWidth: '28px', minHeight: '28px' }}
            />
          </div>
          <span className="text-xs text-slate-600 pt-1">
            I agree to the <button type="button" onClick={() => setTermsModalOpen(true)} className="text-[#1a237e] underline hover:text-[#1a237e]/80 transition-colors">Terms & Conditions</button> and <button type="button" onClick={() => setPrivacyModalOpen(true)} className="text-[#1a237e] underline hover:text-[#1a237e]/80 transition-colors">Privacy Policy</button>. I understand the cancellation policy and that bookings are non-refundable within 24 hours of the activity. *
          </span>
        </label>
      </div>

      <LegalModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        type="terms_conditions"
      />
      <LegalModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        type="privacy_policy"
      />

      {/* Custom Debit/Credit Card Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
        <CreditCard className="w-5 h-5 text-[#1a237e]" />
        <span className="text-sm font-medium text-slate-800">Debit / Credit Card</span>
      </div>

      <div className="stripe-payment-element-wrapper">
        <PaymentElement 
          options={{
            layout: 'auto',
            fields: {
              billingDetails: {
                address: {
                  country: 'never',
                },
              },
            },
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'TH',
                },
              },
            },
            wallets: {
              applePay: 'never',
              googlePay: 'never',
            },
          }}
        />
      </div>
      
      {/* CSS to hide the default Card header from Stripe */}
      <style jsx global>{`
        .stripe-payment-element-wrapper .p-TabLabel,
        .stripe-payment-element-wrapper [class*="TabLabel"],
        .stripe-payment-element-wrapper .p-AccordionItem-header,
        .stripe-payment-element-wrapper [class*="AccordionItem-header"] {
          display: none !important;
        }
      `}</style>
      
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || !agreeTerms}
        className="w-full h-14 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: '#1a237e',
          boxShadow: agreeTerms ? '0 10px 40px rgba(26, 35, 126, 0.3)' : 'none',
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay {formatPrice(amount)}
          </>
        )}
      </button>
    </form>
  );
}
