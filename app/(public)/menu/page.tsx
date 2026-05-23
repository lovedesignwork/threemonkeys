'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Utensils, 
  Wine, 
  ArrowRight,
  Sparkles,
  Flame,
  Leaf,
  Globe,
  Baby,
  IceCream,
  Coffee,
  GlassWater,
  Martini
} from 'lucide-react';

type MenuItem = {
  name: string;
  nameThai?: string;
  price: number | string;
  description?: string;
};

type MenuCategory = {
  id: string;
  name: string;
  icon: React.ElementType;
  items: MenuItem[];
};

const foodCategories: MenuCategory[] = [
  {
    id: 'recommend',
    name: 'Recommend',
    icon: Sparkles,
    items: [
      { name: 'Deep Fried Crispy Chicken Wings', nameThai: 'ปีกไก่ทอดกรอบ', price: 250 },
      { name: 'Fish And Chips', nameThai: 'ฟิชแอนด์ชิปส์', price: 390 },
      { name: 'Fish Fingers Served With Potato Wedges', nameThai: 'ฟิชฟิงเกอร์เสิร์ฟคู่มันฝรั่งทอด', price: 190 },
      { name: 'French Fries', nameThai: 'เฟรนช์ฟรายส์', price: 90 },
      { name: 'Tuna Steak Served With Mango Salad', nameThai: 'สเต็กทูน่าเสิร์ฟคู่กับมะม่วงสลัด', price: 490 },
      { name: 'Australian Tenderloin Steak With Grilled Vegetables And Potatoes, Served With Pepper Sauce', nameThai: 'สเต็กเนื้อ เสิร์ฟคู่กับผักย่างและมันฝรั่งทอด', price: 890 },
      { name: 'Norwegian Salmon Steak Served With Pomelo Salad', nameThai: 'สเต็กปลาแซลมอนเสิร์ฟคู่กับยำส้มโอ', price: 390 },
      { name: 'Spaghetti Seafood In Tomato Sauce', nameThai: 'สปาเก็ตตี้ซีฟู้ด', price: 490 },
      { name: 'Spaghetti Beef Bolognese', nameThai: 'สปาเก็ตตี้โบโลเนส', price: 390 },
      { name: 'Grilled Australian Beef Tenderloin With Spicy Chili Paste', nameThai: 'เสือร้องไห้', price: 890 },
      { name: 'Tom Yum Gung / Seafood Spicy Sour Soup', nameThai: 'ต้มยำกุ้ง-ซีฟู้ด', price: 290 },
      { name: 'Calamari', nameThai: 'คาลามารี', price: 220 },
      { name: 'Soft Prawn Taco', nameThai: 'ทาโก้กุ้ง', price: 350 },
      { name: 'Soft Beef Taco', nameThai: 'ทาโก้เนื้อ', price: 450 },
      { name: '"Wanon" BBQ Half Chicken', nameThai: 'ไก่ย่างวานร', price: 350 },
      { name: 'Caesar Salad', nameThai: 'ซีซ่าสลัด', price: 290 },
      { name: 'Whole Chicken Stuffed With Chestnut And Rice', nameThai: 'ไก่ชูชก', price: 590 },
      { name: 'The Notorious Beef Short Ribs', nameThai: 'เนื้อซี่โครงวัวผัดเครื่องแกงสไตล์บาหลี', price: 550 },
      { name: 'Inspired Braised Lamb Shank', nameThai: 'ขาแกะเคี่ยวซอสสไตล์กีลีมานุก', price: 450 },
    ]
  },
  {
    id: 'thai',
    name: 'Thai',
    icon: Flame,
    items: [
      { name: 'Grilled Australian Beef Tenderloin With Spicy Chili Paste', nameThai: 'เสือร้องไห้', price: 890 },
      { name: 'Whole Chicken Stuffed With Chestnut And Rice', nameThai: 'ไก่ชูชก', price: 590 },
      { name: 'Baked Fish With Herbs In Bamboo', nameThai: 'ข้าวหมกปลาในกระบอกไม้ไผ่', price: 390 },
      { name: 'Coconut Milk Soup With Prawns, Served With Minced Shrimps Dip Paste', nameThai: 'หนุมานประสานกาย', price: 350 },
      { name: '"Wanon" BBQ Half Chicken', nameThai: 'ไก่ย่างวานร', price: 350 },
      { name: 'Steamed Sweet Pork Belly In Black Soy Sauce', nameThai: 'หมูอบอาณาจักร', price: 290 },
      { name: 'Prawns Salad With Tom Yum Paste', nameThai: 'กุ้งลงกา (กุ้งต้มยำแห้ง)', price: 290 },
      { name: 'Stir Fried Minced Pork/Chicken With Yellow Curry Paste', nameThai: 'หนุมานคลุกฝุ่นหมู / ไก่', price: 250 },
      { name: 'Wanon Green Papaya Salad With Banana Blossom', nameThai: 'ส้มตำวานร', price: 190 },
      { name: 'Steamed Mushrooms In Bamboo Thai Style', nameThai: 'เห็ดหมก', price: 190 },
      { name: 'Roasted Spicy Pork Ribs', nameThai: 'กระดูกหมูอ่อนคั่ว', price: 190 },
      { name: 'Deep Fried Prawns Cake', nameThai: 'ทอดมันกุ้ง', price: 250 },
      { name: 'Mixed Beans & Nuts with dried shrimps', nameThai: 'ยำถั่วรวม', price: 150 },
      { name: 'Deep Fried Vegetables Spring Rolls', nameThai: 'ปอเปี๊ยะไส้ผัก', price: 150 },
      { name: 'Sour & Spicy Fresh Salmon And Lemongrass Salad', nameThai: 'พล่าแซลมอน', price: 290 },
      { name: 'Spicy Crispy banana blossom salad with prawns', nameThai: 'ยำทรีมังกี้ส์ (ยำหัวปลีกรอบ)', price: 290 },
      { name: 'A Mix Of Local Vegetables Platter, Served With Mackerel Chili Dip Paste', nameThai: 'น้ำพริกปลาทู', price: 220 },
      { name: 'A Mix Of Local Vegetables Platter, Served With Dried Crispy Shrimps Dip Paste', nameThai: 'น้ำพริกกุ้งเสียบ', price: 220 },
      { name: 'Tom Yum Gung / Seafood Spicy Sour Soup', nameThai: 'ต้มยำกุ้ง - ซีฟู้ด', price: 290 },
      { name: 'Green Curry With Chicken / Prawns / Seafood', nameThai: 'แกงเขียวหวานไก่ / กุ้ง / ซีฟู้ด', price: '250 / 290' },
      { name: 'Massaman Curry With Chicken', nameThai: 'มัสมั่นไก่', price: 250 },
      { name: 'Steamed White Snapper With Chili Lime Sauce', nameThai: 'ปลากะพงนึ่งมะนาว', price: 690 },
      { name: 'Deep Fried White Snapper With Garlic', nameThai: 'ปลากะพงทอดกระเทียม', price: 590 },
      { name: 'Deep Fried White Snapper Topped With Spicy Herbs Salad', nameThai: 'ปลาลุยสวน', price: 490 },
      { name: 'Tom Yum Fried Rice With Prawns', nameThai: 'ข้าวผัดต้มยำกุ้ง', price: 190 },
      { name: 'Thai Southern Rice With Sweet Pork, Chili, Mix Green Herbs', nameThai: 'ข้าวคลุกกะปิ', price: 220 },
      { name: 'Steamed Jasmine Rice (Plate)', nameThai: 'ข้าวสวย (จาน)', price: 30 },
      { name: 'Steamed Jasmine Rice (Bowl)', nameThai: 'ข้าวสวย (โถ)', price: 90 },
    ]
  },
  {
    id: 'western',
    name: 'Western',
    icon: Globe,
    items: [
      { name: 'Corn On The Cob', nameThai: 'ข้าวโพดย่าง', price: 90 },
      { name: 'French Fries', nameThai: 'เฟรนช์ฟรายส์', price: 90 },
      { name: 'Mashed Potato', nameThai: 'มันบดเนื้อครีม', price: 90 },
      { name: 'Potato Wedges', nameThai: 'เวดจ์มันฝรั่ง', price: 90 },
      { name: 'Deep Fried Fish Fillets', nameThai: 'เนื้อปลาชุปแป้งทอด', price: 250 },
      { name: 'Calamari', nameThai: 'คาลามารี', price: 220 },
      { name: 'Deep Fried Crispy Chicken Wings', nameThai: 'ปีกไก่ทอดกรอบ', price: 250 },
      { name: 'Deep Fried Prawns', nameThai: 'กุ้งชุปแป้งทอด', price: 190 },
      { name: 'Greek Salad', nameThai: 'กรีกสลัด', price: 290 },
      { name: 'Caesar Salad', nameThai: 'ซีซ่าสลัด', price: 250 },
      { name: 'Mixed Salad', nameThai: 'สลัดผักรวม', price: 250 },
      { name: 'Avocado Salad', nameThai: 'อโวคาโด้สลัด', price: 290 },
      { name: 'Beef Burger Served With French Fries', nameThai: 'เบอร์เกอร์เนื้อเสิร์ฟคู่เฟรนซ์ฟรายส์', price: 390 },
      { name: 'Crispy Shrimp Burger Served With Potato Wedges', nameThai: 'เบอร์เกอร์คริปปี้กุ้งเสิร์ฟคู่มันฝรั่งทอด', price: 350 },
      { name: 'Chicken Burger Served With Potato Wedges', nameThai: 'เบอร์เกอร์ไก่เสิร์ฟคู่มันฝรั่งทอด', price: 320 },
      { name: 'Soft Beef Taco', nameThai: 'ทาโก้เนื้อ', price: 450 },
      { name: 'Soft Prawn Taco', nameThai: 'ทาโก้กุ้ง', price: 350 },
      { name: 'Spaghetti Seafood In Tomato Sauce', nameThai: 'สปาเก็ตตี้ซีฟู้ด', price: 490 },
      { name: 'Spaghetti With Squid Ink Sauce', nameThai: 'สปาเก็ตตี้หมึกดำ', price: 390 },
      { name: 'Spaghetti Carbonara With Crispy Bacon', nameThai: 'สปาเก็ตตี้คาโบนาร่า', price: 350 },
      { name: 'Spaghetti Beef Bolognese', nameThai: 'สปาเก็ตตี้โบโลเนส', price: 390 },
      { name: 'Angel Hair Pasta With Crispy Bacon, Garlic, Chili', nameThai: 'พาสต้าแองเกิลแฮร์', price: 350 },
      { name: 'Norwegian Salmon Steak Served With Pomelo Salad', nameThai: 'สเต็กปลาแซลมอนเสิร์ฟคู่กับยำส้มโอ', price: 390 },
      { name: 'Tuna Steak Served With Mango Salad', nameThai: 'สเต็กทูน่าเสิร์ฟคู่กับมะม่วงสลัด', price: 490 },
      { name: 'Fish And Chips', nameThai: 'ฟิชแอนด์ชิปส์', price: 390 },
      { name: 'Australian Tenderloin Steak With Grilled Vegetables And Potatoes', nameThai: 'สเต็กเนื้อ เสิร์ฟคู่กับผักย่างและมันฝรั่งทอด', price: 890 },
      { name: 'Australian Sirloin Steak Braised In Konbu Seaweed With Buttered Mash', nameThai: 'พายเนื้อวัว / Umami Konbu Beef Pie', price: 450 },
      { name: 'Pork Chop With Grilled Vegetables, Served With Pepper Sauce', nameThai: 'พอร์คชอป เสิร์ฟคู่กับผักย่าง', price: 590 },
    ]
  },
  {
    id: 'bali',
    name: 'Bali',
    icon: Leaf,
    items: [
      { name: 'Inspired Braised Lamb Shank', nameThai: 'ขาแกะเคี่ยวซอสสไตล์กีลีมานุก', price: 450 },
      { name: 'Signature BBQ Spare Ribs', nameThai: 'ซี่โครงหมูย่างสูตรต้นตำรับนอตี้นูรี้ส์ปี 1999', price: 550 },
      { name: 'Devilish Cheese Poky Nachos', nameThai: 'นาโชส์หมูชีสขาเลาะ', price: 290 },
      { name: 'Nasi Goreng Fried Rice with Roasted Pork', nameThai: 'นาสิโกเร็ง ข้าวผัดสไตล์อินโด', price: 250 },
      { name: 'Mee Goreng Basah Fried Noodles With Roasted Pork', nameThai: 'หมี่โกเร็งหมี่ผัดสไตล์อินโด', price: 250 },
      { name: 'The Notorious Beef Short Ribs', nameThai: 'เนื้อซี่โครงวัวผัดเครื่องแกงสไตล์บาหลี', price: 550 },
    ]
  },
  {
    id: 'japanese',
    name: 'Japanese',
    icon: Utensils,
    items: [
      { name: 'Salmon Sashimi', nameThai: 'ซาชิมิแซลมอน', price: 390 },
      { name: 'Tuna Sashimi', nameThai: 'ซาชิมิทูน่า', price: 450 },
      { name: 'Mixed Sashimi Platter', nameThai: 'จานซาชิมิรวม', price: 590 },
      { name: 'California Roll', nameThai: 'แคลิฟอร์เนียโรล', price: 290 },
      { name: 'Dragon Roll', nameThai: 'ดราก้อนโรล', price: 390 },
      { name: 'Tempura Prawns', nameThai: 'กุ้งเทมปุระ', price: 290 },
    ]
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    icon: Leaf,
    items: [
      { name: 'Mixed Salad', nameThai: 'สลัดผักรวม', price: 250 },
      { name: 'Greek Salad', nameThai: 'กรีกสลัด', price: 290 },
      { name: 'Deep Fried Vegetables Spring Rolls', nameThai: 'ปอเปี๊ยะไส้ผัก', price: 150 },
      { name: 'Steamed Mushrooms In Bamboo Thai Style', nameThai: 'เห็ดหมก', price: 190 },
      { name: 'Stir Fried Mixed Vegetables With Oyster Sauce', nameThai: 'ผัดผักรวม', price: 190 },
      { name: 'French Fries', nameThai: 'เฟรนช์ฟรายส์', price: 90 },
      { name: 'Corn On The Cob', nameThai: 'ข้าวโพดย่าง', price: 90 },
      { name: 'Mashed Potato', nameThai: 'มันบดเนื้อครีม', price: 90 },
    ]
  },
  {
    id: 'kids',
    name: 'Kids',
    icon: Baby,
    items: [
      { name: 'Chicken Fingers Served With French Fries', nameThai: 'ชิคเก้นฟิงเกอร์เสิร์ฟคู่เฟรนช์ฟรายส์', price: 190 },
      { name: 'Fish Fingers Served With Potato Wedges', nameThai: 'ฟิชฟิงเกอร์เสิร์ฟคู่มันฝรั่งทอด', price: 190 },
      { name: 'Spaghetti Beef Bolognese', nameThai: 'สปาเก็ตตี้โบโลเนส', price: 390 },
      { name: 'French Fries', nameThai: 'เฟรนช์ฟรายส์', price: 90 },
      { name: 'Chicken Burger Served With Potato Wedges', nameThai: 'เบอร์เกอร์ไก่เสิร์ฟคู่มันฝรั่งทอด', price: 320 },
    ]
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: IceCream,
    items: [
      { name: 'Poached banana in syrup, served with coconut ice cream', nameThai: 'กล้วยไข่เชื่อมเสิร์ฟกับไอศกรีมกะทิ', price: 190 },
      { name: 'Monkeys banana balls, served with vanilla ice cream', nameThai: 'กล้วยซ่อนรูป', price: 250 },
      { name: 'Homemade poached banana in sweet coconut milk', nameThai: 'กล้วยบวดชีมะพร้าวอ่อน', price: 80 },
      { name: 'Thai traditional sticky rice with fresh mango, served with coconut milk', nameThai: 'ข้าวเหนียวมะม่วง', price: 190 },
      { name: 'Creme Brulee served in a coconut', nameThai: 'ครีมบลูเล่ในลูกมะพร้าว', price: 250 },
      { name: 'Chocolate Fondant, served with vanilla ice cream', nameThai: 'ช็อกโกแลตฟองดอง', price: 270 },
      { name: 'Mix Taros in sweet coconut milk', nameThai: 'บัวลอยเผือก', price: 80 },
      { name: 'Mix Fruit (Seasonal)', nameThai: 'ผลไม้รวม', price: 170 },
      { name: 'Coconut ice cream, served in fresh coconut', nameThai: 'ไอศกรีมกะทิเสิร์ฟในลูกมะพร้าว', price: 190 },
      { name: 'Banana Split', nameThai: 'บานานาสปลิต', price: 230 },
      { name: 'Chocolate Sundae', nameThai: 'ช็อกโกแลตซันเดย์', price: 230 },
      { name: 'Strawberry Sundae', nameThai: 'สตรอว์เบอร์รี่ซันเดย์', price: 230 },
      { name: 'Vanilla Sundae', nameThai: 'วนิลาซันเดย์', price: 230 },
      { name: 'Brownie Nutella, served with one scoop of vanilla ice cream', nameThai: 'บราวนี่นูเทลล่า', price: 280 },
      { name: 'Honey Toast, served with one scoop of vanilla ice cream', nameThai: 'ฮันนี่โทสต์', price: 250 },
      { name: 'Caramel Honey Toast, served with one scoop of caramel ice cream', nameThai: 'คาราเมลฮันนี่โทสต์', price: 280 },
      { name: 'Strawberry Honey Toast, served with one scoop of strawberry ice cream', nameThai: 'สตรอว์เบอร์รี่ฮันนี่โทสต์', price: 280 },
      { name: 'Chocolate Honey Toast, served with one scoop of chocolate ice cream', nameThai: 'ช็อกโกแลตฮันนี่โทสต์', price: 280 },
    ]
  },
];

const drinkCategories: MenuCategory[] = [
  {
    id: 'three-monkeys-tea',
    name: 'Three Monkeys Tea',
    icon: Leaf,
    items: [
      { name: 'Cascara Cinnamon', nameThai: 'ชาเปลือกกาแฟอบเชย', price: 150 },
      { name: 'Cascara Ginger', nameThai: 'ชาเปลือกกาแฟขิง', price: 150 },
      { name: 'Coffee Blossom', nameThai: 'ชาดอกกาแฟ', price: 150 },
      { name: 'Ginger', nameThai: 'ชาขิง', price: 150 },
      { name: 'Oolong', nameThai: 'ชาอู่หลง', price: 150 },
      { name: 'Rose', nameThai: 'ชากุหลาบ', price: 150 },
    ]
  },
  {
    id: 'signature-coffee',
    name: 'Signature Coffee',
    icon: Coffee,
    items: [
      { name: 'Three Monkeys Signature', price: 180 },
      { name: 'Coconut Coffee', price: 160 },
      { name: 'Jungle Espresso', price: 150 },
      { name: 'Rainforest Latte', price: 170 },
      { name: 'Thai Coffee', nameThai: 'กาแฟโบราณ', price: 120 },
    ]
  },
  {
    id: 'classic-coffee',
    name: 'Classic Coffee',
    icon: Coffee,
    items: [
      { name: 'Espresso', price: 90 },
      { name: 'Americano', price: 100 },
      { name: 'Cappuccino', price: 120 },
      { name: 'Latte', price: 130 },
      { name: 'Mocha', price: 140 },
      { name: 'Macchiato', price: 110 },
    ]
  },
  {
    id: 'non-coffee',
    name: 'Non Coffee',
    icon: GlassWater,
    items: [
      { name: 'Hot Chocolate', price: 130 },
      { name: 'Matcha Latte', price: 140 },
      { name: 'Chai Latte', price: 130 },
      { name: 'Thai Tea', nameThai: 'ชาไทย', price: 100 },
      { name: 'Green Tea', nameThai: 'ชาเขียว', price: 100 },
    ]
  },
  {
    id: 'signature-juices',
    name: 'Signature Juices',
    icon: GlassWater,
    items: [
      { name: 'Jungle Detox', price: 150 },
      { name: 'Tropical Paradise', price: 140 },
      { name: 'Green Energy', price: 150 },
      { name: 'Monkey Mix', price: 160 },
    ]
  },
  {
    id: 'fresh-juices',
    name: 'Fresh Juices',
    icon: GlassWater,
    items: [
      { name: 'Orange Juice', price: 100 },
      { name: 'Pineapple Juice', price: 100 },
      { name: 'Watermelon Juice', price: 90 },
      { name: 'Mango Juice', price: 110 },
      { name: 'Coconut Water', price: 80 },
      { name: 'Lime Juice', price: 80 },
    ]
  },
  {
    id: 'smoothies',
    name: 'Signature Smoothies',
    icon: GlassWater,
    items: [
      { name: 'Monkey Madness', price: 150 },
      { name: 'Tropical Storm', price: 140 },
      { name: 'Berry Blast', price: 150 },
      { name: 'Jungle Green', price: 140 },
    ]
  },
  {
    id: 'fruit-shakes',
    name: 'Fruit Shakes',
    icon: GlassWater,
    items: [
      { name: 'Mango Shake', price: 120 },
      { name: 'Banana Shake', price: 100 },
      { name: 'Strawberry Shake', price: 130 },
      { name: 'Mixed Fruit Shake', price: 130 },
    ]
  },
  {
    id: 'milkshakes',
    name: 'Milkshakes',
    icon: GlassWater,
    items: [
      { name: 'Chocolate Milkshake', price: 130 },
      { name: 'Vanilla Milkshake', price: 120 },
      { name: 'Strawberry Milkshake', price: 130 },
      { name: 'Oreo Milkshake', price: 140 },
    ]
  },
  {
    id: 'signature-cocktails',
    name: 'Signature Cocktails',
    icon: Martini,
    items: [
      { name: 'Three Monkeys Special', price: 320 },
      { name: 'Jungle Fever', price: 290 },
      { name: 'Rainforest Sunset', price: 280 },
      { name: 'Monkey Business', price: 300 },
      { name: 'Andaman Breeze', price: 290 },
    ]
  },
  {
    id: 'classic-cocktails',
    name: 'Classic Cocktails',
    icon: Martini,
    items: [
      { name: 'Mojito', price: 250 },
      { name: 'Margarita', price: 260 },
      { name: 'Piña Colada', price: 260 },
      { name: 'Long Island Iced Tea', price: 290 },
      { name: 'Cosmopolitan', price: 270 },
      { name: 'Mai Tai', price: 270 },
      { name: 'Daiquiri', price: 250 },
    ]
  },
  {
    id: 'mocktails',
    name: 'Mocktails',
    icon: Wine,
    items: [
      { name: 'Virgin Mojito', price: 150 },
      { name: 'Sunrise Paradise', price: 140 },
      { name: 'Blue Ocean', price: 150 },
      { name: 'Fruit Punch', price: 130 },
      { name: 'Tropical Fizz', price: 140 },
    ]
  },
  {
    id: 'soda',
    name: 'Soft Drinks & Soda',
    icon: GlassWater,
    items: [
      { name: 'Coca-Cola', price: 60 },
      { name: 'Sprite', price: 60 },
      { name: 'Fanta', price: 60 },
      { name: 'Soda Water', price: 50 },
      { name: 'Tonic Water', price: 60 },
      { name: 'Ginger Ale', price: 70 },
    ]
  },
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<'food' | 'drinks'>('food');
  const [activeCategory, setActiveCategory] = useState('recommend');

  const categories = activeTab === 'food' ? foodCategories : drinkCategories;
  const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];

  const handleTabChange = (tab: 'food' | 'drinks') => {
    setActiveTab(tab);
    setActiveCategory(tab === 'food' ? 'recommend' : 'three-monkeys-tea');
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/32_resize.jpg"
            alt="Menu"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-full text-[#b1b94c] text-sm font-medium mb-6">
              <Utensils className="w-4 h-4" />
              Our Menu
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case">
              Taste the <span className="text-[#b1b94c]">Jungle</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-[family-name:var(--font-inter)]">
              From authentic Southern Thai cuisine to international favorites, every dish is crafted with fresh, locally-sourced ingredients
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Tabs */}
      <section className="sticky top-[60px] z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4 py-4">
            <button
              onClick={() => handleTabChange('food')}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-[family-name:var(--font-krona)] text-sm uppercase tracking-wider transition-all ${
                activeTab === 'food'
                  ? 'bg-[#b1b94c] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4" />
              Food
            </button>
            <button
              onClick={() => handleTabChange('drinks')}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-[family-name:var(--font-krona)] text-sm uppercase tracking-wider transition-all ${
                activeTab === 'drinks'
                  ? 'bg-[#b1b94c] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Wine className="w-4 h-4" />
              Drinks
            </button>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-[124px] z-30 bg-[#111]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 py-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-[#b1b94c]/20 text-[#b1b94c] border border-[#b1b94c]/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-[#b1b94c]/10 rounded-2xl flex items-center justify-center">
                  <currentCategory.icon className="w-7 h-7 text-[#b1b94c]" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-krona)] text-white normal-case">
                    {currentCategory.name}
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    {currentCategory.items.length} items
                  </p>
                </div>
              </div>

              {/* Menu Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {currentCategory.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group p-5 bg-[#111] rounded-2xl border border-white/5 hover:border-[#b1b94c]/20 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-base leading-snug mb-1 group-hover:text-[#b1b94c] transition-colors">
                          {item.name}
                        </h3>
                        {item.nameThai && (
                          <p className="text-white/40 text-sm truncate">
                            {item.nameThai}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-white/50 text-sm mt-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-[#b1b94c] font-[family-name:var(--font-krona)] text-lg">
                          ฿{item.price}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Tax Notice */}
          <div className="mt-12 p-6 bg-[#111] rounded-2xl border border-white/10 text-center">
            <p className="text-white/50 text-sm font-[family-name:var(--font-inter)]">
              All prices are subject to a 10% service charge and 7% government tax
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-10 h-10 text-[#b1b94c] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case">
              Ready to Dine in the <span className="text-[#b1b94c]">Jungle?</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              Reserve your table and experience our cuisine surrounded by nature
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <button className="inline-flex items-center gap-3 px-10 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                  Reserve a Table
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/special-packages">
                <button className="inline-flex items-center gap-2 px-10 py-4 border border-white/20 text-white font-[family-name:var(--font-krona)] rounded-full hover:bg-white hover:text-black transition-all">
                  Special Packages
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
