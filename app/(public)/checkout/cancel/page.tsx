'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw, Phone, Mail, MessageCircle } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <main className="min-h-screen pt-20 bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <XCircle className="w-12 h-12 text-red-500" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Reservation Cancelled</h1>
            <p className="text-white/90">Your table reservation was not completed</p>
          </div>

          <div className="p-6 md:p-8">
            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <p className="text-slate-600 text-center">
                Don&apos;t worry! Your reservation has not been charged. You can try again or contact us to book your table.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="font-semibold text-slate-800">What would you like to do?</h3>
              
              <Link href="/booking" className="block">
                <div className="flex items-center gap-4 p-4 bg-[#b1b94c]/10 hover:bg-[#b1b94c]/20 rounded-xl transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-[#b1b94c] rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Try Again</p>
                    <p className="text-sm text-slate-500">Make a new reservation</p>
                  </div>
                </div>
              </Link>

              <Link href="/" className="block">
                <div className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Return Home</p>
                    <p className="text-sm text-slate-500">Go back to the homepage</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-orange-800 mb-3">Having trouble?</h3>
              <p className="text-sm text-orange-700 mb-4">
                If you're experiencing issues with payment, please check:
              </p>
              <ul className="space-y-2 text-sm text-orange-700">
                <li>• Your card has sufficient funds</li>
                <li>• The card details are entered correctly</li>
                <li>• Your bank has approved international transactions</li>
                <li>• Try using a different payment method</li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500 mb-4">Need assistance? Contact our support team</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <a
                  href="tel:+6676323264"
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#b1b94c]" />
                  <span className="text-slate-700">Call Us</span>
                </a>
                <a
                  href="mailto:enjoy@threemonkeysphuket.com"
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#b1b94c]" />
                  <span className="text-slate-700">Email</span>
                </a>
                <a
                  href="https://wa.me/6676323264"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-20 bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    }>
      <CancelContent />
    </Suspense>
  );
}
