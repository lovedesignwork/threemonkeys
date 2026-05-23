'use client';

import { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { LegalModal } from '@/components/ui/LegalModal';

interface EmbeddedCardFormProps {
  amount: number;
  isCustomerFormValid: boolean;
  onSubmit: () => Promise<{ clientSecret: string; bookingRef: string } | null>;
  isCreatingBooking: boolean;
}

export default function EmbeddedCardForm({
  amount,
  isCustomerFormValid,
  onSubmit,
  isCreatingBooking,
}: EmbeddedCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const cardComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!isCustomerFormValid) {
      setErrorMessage('Please fill in all customer details first.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms & Conditions.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await onSubmit();
      
      if (!result) {
        setIsProcessing(false);
        return;
      }

      const { clientSecret, bookingRef } = result;

      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        window.location.href = `/checkout/success?booking_ref=${bookingRef}&payment_intent=${paymentIntent.id}`;
      } else {
        window.location.href = `/checkout/success?booking_ref=${bookingRef}&payment_intent=${paymentIntent?.id}`;
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  const elementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.4)',
        },
        iconColor: '#b1b94c',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  const canSubmit = stripe && agreeTerms && isCustomerFormValid && cardComplete && !isProcessing && !isCreatingBooking;

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
              className="w-7 h-7 rounded-full border-2 border-white/20 checked:bg-[#b1b94c] checked:border-[#b1b94c] focus:ring-[#b1b94c] focus:ring-2 appearance-none cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:font-bold after:opacity-0 checked:after:opacity-100 bg-white/5"
              style={{ minWidth: '28px', minHeight: '28px' }}
            />
          </div>
          <span className="text-xs text-white/70 pt-1">
            I agree to the <button type="button" onClick={() => setTermsModalOpen(true)} className="text-[#b1b94c] underline hover:text-[#c4cc5a] transition-colors">Terms & Conditions</button> and <button type="button" onClick={() => setPrivacyModalOpen(true)} className="text-[#b1b94c] underline hover:text-[#c4cc5a] transition-colors">Privacy Policy</button>. I understand the cancellation policy and that bookings are non-refundable within 24 hours of the activity. *
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

      {/* Debit/Credit Card Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <CreditCard className="w-5 h-5 text-[#b1b94c]" />
        <span className="text-sm font-medium text-white">Debit / Credit Card</span>
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">Card Number</label>
        <div className="bg-white/5 border border-[#b1b94c]/30 rounded-xl p-4 focus-within:border-[#b1b94c] transition-colors">
          <CardNumberElement
            options={elementStyle}
            onChange={(e) => {
              setCardNumberComplete(e.complete);
              if (e.error) {
                setErrorMessage(e.error.message);
              } else if (!cardExpiryComplete || !cardCvcComplete) {
                setErrorMessage(null);
              }
            }}
          />
        </div>
      </div>

      {/* Expiry Date and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Expiry Date</label>
          <div className="bg-white/5 border border-[#b1b94c]/30 rounded-xl p-4 focus-within:border-[#b1b94c] transition-colors">
            <CardExpiryElement
              options={elementStyle}
              onChange={(e) => {
                setCardExpiryComplete(e.complete);
                if (e.error) {
                  setErrorMessage(e.error.message);
                } else if (cardNumberComplete && cardCvcComplete) {
                  setErrorMessage(null);
                }
              }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">CVV / CVC</label>
          <div className="bg-white/5 border border-[#b1b94c]/30 rounded-xl p-4 focus-within:border-[#b1b94c] transition-colors">
            <CardCvcElement
              options={elementStyle}
              onChange={(e) => {
                setCardCvcComplete(e.complete);
                if (e.error) {
                  setErrorMessage(e.error.message);
                } else if (cardNumberComplete && cardExpiryComplete) {
                  setErrorMessage(null);
                }
              }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-14 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#b1b94c] to-[#8a9139]"
        style={{
          boxShadow: canSubmit ? '0 10px 40px rgba(177, 185, 76, 0.3)' : 'none',
        }}
      >
        {isProcessing || isCreatingBooking ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isCreatingBooking ? 'Creating booking...' : 'Processing payment...'}
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
