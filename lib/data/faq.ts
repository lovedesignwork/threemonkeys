import { FAQ } from '@/types';

export const faqs: FAQ[] = [
  {
    id: '1',
    question: 'What are your operating hours?',
    answer: 'We are open daily from 11:00 AM to 10:00 PM. Lunch service is from 11:00 AM to 3:00 PM, and dinner service is from 6:00 PM to 10:00 PM. Last orders are taken 30 minutes before closing.',
    category: 'Operating Hours',
  },
  {
    id: '2',
    question: 'Do you have a dress code?',
    answer: 'We recommend smart casual attire for dinner service. Beachwear, flip-flops, and sleeveless shirts for men are not permitted during evening service. Lunch service has a more relaxed dress code.',
    category: 'Dress Code',
  },
  {
    id: '3',
    question: 'How far in advance should I make a reservation?',
    answer: 'We recommend booking at least 2-3 days in advance, especially for dinner and weekend visits. For special occasions, tasting menus, or groups of 6 or more, we suggest booking 1-2 weeks ahead.',
    category: 'Reservations',
  },
  {
    id: '4',
    question: 'Can I modify or cancel my reservation?',
    answer: 'Yes, you can modify or cancel your reservation up to 24 hours before your scheduled time at no charge. Cancellations within 24 hours or no-shows may incur a fee for tasting menu bookings.',
    category: 'Reservations',
  },
  {
    id: '5',
    question: 'Do you accommodate dietary restrictions?',
    answer: 'Yes, we can accommodate most dietary requirements including vegetarian, vegan, gluten-free, and common food allergies. Please inform us when booking so our kitchen can prepare accordingly.',
    category: 'Dietary',
  },
  {
    id: '6',
    question: 'Is the menu halal or do you serve pork-free options?',
    answer: 'While our kitchen is not halal-certified, we offer many pork-free and alcohol-free dishes. Please let us know your requirements when booking and we will guide you through suitable options.',
    category: 'Dietary',
  },
  {
    id: '7',
    question: 'Do you have a children\'s menu?',
    answer: 'Yes, we have a children\'s menu with milder versions of Thai classics and some international favorites. High chairs are available. Children of all ages are welcome, though we suggest the tasting menu for guests 12 and older.',
    category: 'Dietary',
  },
  {
    id: '8',
    question: 'Is parking available?',
    answer: 'Yes, we have free on-site parking for up to 30 vehicles. Valet parking is also available during dinner service on weekends.',
    category: 'Transportation',
  },
  {
    id: '9',
    question: 'Do you offer hotel pickup service?',
    answer: 'Yes! Most of our dining packages include complimentary round-trip transfers from hotels in Patong, Kata, Karon, and Phuket Town. Private transfers are available for other locations at an additional cost.',
    category: 'Transportation',
  },
  {
    id: '10',
    question: 'Do you accommodate large groups?',
    answer: 'Yes, we welcome groups up to 40 guests for regular dining and can accommodate larger parties for private events. Group bookings of 10 or more receive special rates. Please contact us directly for group arrangements.',
    category: 'Group Bookings',
  },
  {
    id: '11',
    question: 'Can you host private events or buyouts?',
    answer: 'Yes, we offer private dining areas and full restaurant buyouts for special occasions, corporate events, and celebrations. Custom menus and decorations are available. Please inquire at least 2 weeks in advance.',
    category: 'Group Bookings',
  },
  {
    id: '12',
    question: 'Do you cater for special occasions?',
    answer: 'We love helping celebrate special moments! We can arrange custom cakes, flower arrangements, personalized menus, and photography assistance. Let us know about your celebration when booking.',
    category: 'Special Occasions',
  },
  {
    id: '13',
    question: 'Can you accommodate proposals or surprises?',
    answer: 'We are experts at discreet celebrations! Contact us in advance to arrange champagne moments, custom desserts with messages, flowers, or any special touches you have in mind.',
    category: 'Special Occasions',
  },
  {
    id: '14',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Thai QR payments, and cash (Thai Baht). Online bookings are processed through secure Stripe payment.',
    category: 'Payment',
  },
  {
    id: '15',
    question: 'Do you offer gift vouchers?',
    answer: 'Yes, we offer gift vouchers for all our dining packages. These make perfect gifts for special occasions and are valid for 6 months from purchase. Available for purchase online or at the restaurant.',
    category: 'Payment',
  },
  {
    id: '16',
    question: 'What is included in the tasting menu?',
    answer: 'Our tasting menu includes 8-10 courses showcasing the best of Thai cuisine, a welcome drink, palate cleansers, and petit fours. Wine pairing can be added. The experience lasts approximately 2.5-3 hours.',
    category: 'Menu',
  },
];

export function getFAQsByCategory(category: string): FAQ[] {
  return faqs.filter(faq => faq.category === category);
}

export function getFAQCategories(): string[] {
  return [...new Set(faqs.map(faq => faq.category))];
}
