'use client';

import { motion } from 'framer-motion';
import { Section, Container } from '@/components/craft';
import { 
  Shield, 
  Heart, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Leaf,
  Award,
  Users,
  Utensils
} from 'lucide-react';

export default function SafetyPage() {
  return (
    <main className="pt-20">
      <Section className="bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Shield className="w-16 h-16 text-[#b1b94c] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4 font-[family-name:var(--font-krona)]">Food Safety & Quality</h1>
            <p className="text-white/70">Your health and satisfaction are our top priorities. Learn about our commitment to food safety and quality.</p>
          </motion.div>
        </Container>
      </Section>

      <Section className="bg-white py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Quick Info */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-xl p-5 text-center">
                <Leaf className="w-10 h-10 text-[#1a1a1a] mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-1">Fresh Daily</h3>
                <p className="text-sm text-slate-600">Ingredients sourced fresh from local markets every morning</p>
              </div>
              <div className="bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-xl p-5 text-center">
                <Award className="w-10 h-10 text-[#1a1a1a] mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-1">Certified Kitchen</h3>
                <p className="text-sm text-slate-600">HACCP compliant food handling standards</p>
              </div>
              <div className="bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-xl p-5 text-center">
                <Clock className="w-10 h-10 text-[#1a1a1a] mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-1">Arrive 15 Min Early</h3>
                <p className="text-sm text-slate-600">Before your reservation time</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Dietary Requirements & Allergies
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    We Can Accommodate:
                  </h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Vegetarian and vegan diets
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Gluten-free requirements
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Nut and shellfish allergies
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Dairy-free options
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      Halal preparations (on request)
                    </li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Please Inform Us Of:
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">!</span>
                      Any severe food allergies
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">!</span>
                      Religious dietary restrictions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">!</span>
                      Medical dietary needs
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">!</span>
                      Pregnancy (for raw fish dishes)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">!</span>
                      Children with specific needs
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 not-prose mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Important Allergy Information</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Please inform us of any allergies when making your reservation. While we take every precaution, our kitchen handles common allergens including:
                    </p>
                    <ul className="text-sm text-blue-700 grid md:grid-cols-2 gap-1">
                      <li>• Peanuts and tree nuts</li>
                      <li>• Shellfish and fish</li>
                      <li>• Soy and sesame</li>
                      <li>• Eggs and dairy</li>
                      <li>• Wheat/gluten</li>
                      <li>• MSG (fish sauce)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="flex items-center gap-2">
                <Utensils className="w-6 h-6 text-[#1a1a1a]" />
                Dress Code
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-semibold text-green-800 mb-3">Recommended Attire</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Smart casual for dinner service
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Collared shirts or elegant tops
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Long pants, elegant shorts, or dresses
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Closed shoes or elegant sandals
                    </li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-800 mb-3">Lunch Service</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                      Resort casual is acceptable
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                      Neat and clean attire
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                      Comfortable footwear
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Children & Families
              </h2>
              
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 not-prose mb-8">
                <p className="text-purple-700 mb-3">
                  Families with children are welcome at Three Monkeys. We offer:
                </p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Children&apos;s menu available</li>
                  <li>• High chairs upon request</li>
                  <li>• Child-friendly dishes can be prepared with less spice</li>
                  <li>• Early dinner seating options for families</li>
                </ul>
              </div>

              <h2>Our Quality Standards</h2>
              <p>
                At Three Monkeys, quality and safety are paramount. Our commitment includes:
              </p>
              <ul>
                <li><strong>Fresh Ingredients:</strong> Sourced daily from local markets and trusted suppliers</li>
                <li><strong>Trained Staff:</strong> All kitchen staff certified in food safety and hygiene</li>
                <li><strong>Clean Environment:</strong> Kitchen and dining areas maintained to highest hygiene standards</li>
                <li><strong>Temperature Control:</strong> Strict adherence to food storage and cooking temperatures</li>
                <li><strong>Regular Inspections:</strong> Routine health and safety audits</li>
              </ul>

              <h2>Questions?</h2>
              <p>
                If you have any questions about dietary requirements or special needs, 
                please contact us before your visit:
              </p>
              <ul>
                <li>Email: enjoy@threemonkeysphuket.com</li>
                <li>Phone: +66 98-010-8838</li>
                <li>WhatsApp: +66 98-010-8838</li>
              </ul>
            </div>
          </motion.div>
        </Container>
      </Section>
    </main>
  );
}
