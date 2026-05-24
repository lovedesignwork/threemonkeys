'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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
  image?: string;
};

type MenuCategory = {
  id: string;
  name: string;
  folderName: string;
  icon: React.ElementType;
  items: MenuItem[];
};

const foodCategories: MenuCategory[] = [
  {
    id: 'all-food',
    name: 'All Food',
    folderName: '',
    icon: Utensils,
    items: [] // Will be populated dynamically
  },
  {
    id: 'recommend',
    name: 'Recommend',
    folderName: 'Recommend',
    icon: Sparkles,
    items: [
      { name: 'Deep Fried Crispy Chicken Wings', nameThai: 'ปีกไก่ทอดกรอบ', price: 250 },
      { name: 'Fish And Chips', nameThai: 'ฟิชแอนด์ชิปส์', price: 390 },
      { name: 'Fish Fingers Served With Potato Wedges', nameThai: 'ฟิชฟิงเกอร์เสิร์ฟคู่มันฝรั่งทอด', price: 190 },
      { name: 'French Fries', nameThai: 'เฟรนช์ฟรายส์', price: 90 },
      { name: 'Tuna Steak Served With Mango Salad', nameThai: 'สเต็กทูน่าเสิร์ฟคู่กับมะม่วงสลัด', price: 490 },
      { name: 'Australian Tenderloin Steak With Grilled Vegetables And Potatoes', nameThai: 'สเต็กเนื้อ เสิร์ฟคู่กับผักย่างและมันฝรั่งทอด', price: 890 },
      { name: 'Norwegian Salmon Steak Served With Pomelo Salad', nameThai: 'สเต็กปลาแซลมอนเสิร์ฟคู่กับยำส้มโอ', price: 390 },
      { name: 'Spaghetti Seafood In Tomato Sauce', nameThai: 'สปาเก็ตตี้ซีฟู้ด', price: 490 },
      { name: 'Spaghetti Beef Bolognese', nameThai: 'สปาเก็ตตี้โบโลเนส', price: 390 },
      { name: 'Grilled Australian Beef Tenderloin With Spicy Chili Paste', nameThai: 'เสือร้องไห้', price: 890 },
      { name: 'Tom Yum Gung Seafood Spicy Sour Soup', nameThai: 'ต้มยำกุ้ง-ซีฟู้ด', price: 290 },
      { name: 'Calamari', nameThai: 'คาลามารี', price: 220 },
      { name: 'Soft Prawn Taco', nameThai: 'ทาโก้กุ้ง', price: 350 },
      { name: 'Soft Beef Taco', nameThai: 'ทาโก้เนื้อ', price: 450 },
      { name: 'Wanon BBQ Half Chicken', nameThai: 'ไก่ย่างวานร', price: 350 },
      { name: 'Caesar Salad', nameThai: 'ซีซ่าสลัด', price: 290 },
      { name: 'Whole Chicken Stuffed With Chestnut And Rice', nameThai: 'ไก่ชูชก', price: 590 },
      { name: 'The Notorious Beef Short Ribs', nameThai: 'เนื้อซี่โครงวัวผัดเครื่องแกงสไตล์บาหลี', price: 550 },
      { name: 'Inspired Braised Lamb Shank', nameThai: 'ขาแกะเคี่ยวซอสสไตล์กีลีมานุก', price: 450 },
      { name: 'Chicken Burger Served With Potato Wedges', nameThai: 'เบอร์เกอร์ไก่เสิร์ฟคู่มันฝรั่งทอด', price: 320 },
      { name: 'Beef Burger Served With French Fries', nameThai: 'เบอร์เกอร์เนื้อเสิร์ฟคู่เฟรนซ์ฟรายส์', price: 390 },
      { name: 'Crispy Shrimp Burger Served With Potato Wedges', nameThai: 'เบอร์เกอร์คริปปี้กุ้งเสิร์ฟคู่มันฝรั่งทอด', price: 350 },
      { name: 'Chicken Fingers Served With French Fries', nameThai: 'ชิคเก้นฟิงเกอร์เสิร์ฟคู่เฟรนช์ฟรายส์', price: 190 },
      { name: 'Tom Yum Fried Rice With Prawns', nameThai: 'ข้าวผัดต้มยำกุ้ง', price: 190 },
      { name: 'Corn On The Cob', nameThai: 'ข้าวโพดย่าง', price: 90 },
      { name: 'Potato Wedges', nameThai: 'เวดจ์มันฝรั่ง', price: 90 },
      { name: 'Mashed Potato', nameThai: 'มันบดเนื้อครีม', price: 90 },
      { name: 'Deep Fried Vegetables Spring Rolls', nameThai: 'ปอเปี๊ยะไส้ผัก', price: 150 },
    ]
  },
  {
    id: 'thai',
    name: 'Thai',
    folderName: 'Thai',
    icon: Flame,
    items: [
      { name: 'Grilled Australian Beef Tenderloin With Spicy Chili Paste', nameThai: 'เสือร้องไห้', price: 890 },
      { name: 'Whole Chicken Stuffed With Chestnut And Rice', nameThai: 'ไก่ชูชก', price: 590 },
      { name: 'Baked Fish With Herbs In Bamboo', nameThai: 'ข้าวหมกปลาในกระบอกไม้ไผ่', price: 390 },
      { name: 'Coconut Milk Soup With Prawns Served With Minced Shrimps Dip Paste', nameThai: 'หนุมานประสานกาย', price: 350 },
      { name: 'Wanon BBQ Half Chicken', nameThai: 'ไก่ย่างวานร', price: 350 },
      { name: 'Steamed Sweet Pork Belly In Black Soy Sauce', nameThai: 'หมูอบอาณาจักร', price: 290 },
      { name: 'Prawns Salad With Tom Yum Paste', nameThai: 'กุ้งลงกา (กุ้งต้มยำแห้ง)', price: 290 },
      { name: 'Stir Fried Minced Pork or Chicken With Yellow Curry Paste', nameThai: 'หนุมานคลุกฝุ่นหมู / ไก่', price: 250 },
      { name: 'Wanon Green Papaya Salad With Banana Blossom', nameThai: 'ส้มตำวานร', price: 190 },
      { name: 'Steamed Mushrooms In Bamboo Thai Style', nameThai: 'เห็ดหมก', price: 190 },
      { name: 'Roasted Spicy Pork Ribs', nameThai: 'กระดูกหมูอ่อนคั่ว', price: 190 },
      { name: 'Deep Fried Prawns Cake', nameThai: 'ทอดมันกุ้ง', price: 250 },
      { name: 'Mixed Beans And Nuts With Dried Shrimps', nameThai: 'ยำถั่วรวม', price: 150 },
      { name: 'Deep Fried Vegetables Spring Rolls', nameThai: 'ปอเปี๊ยะไส้ผัก', price: 150 },
      { name: 'Sour And Spicy Fresh Salmon And Lemongrass Salad', nameThai: 'พล่าแซลมอน', price: 290 },
      { name: 'Spicy Crispy Banana Blossom Salad With Prawns', nameThai: 'ยำทรีมังกี้ส์ (ยำหัวปลีกรอบ)', price: 290 },
      { name: 'Local Vegetables Platter With Mackerel Chili Dip Paste', nameThai: 'น้ำพริกปลาทู', price: 220 },
      { name: 'Local Vegetables Platter With Dried Crispy Shrimps Dip Paste', nameThai: 'น้ำพริกกุ้งเสียบ', price: 220 },
      { name: 'Tom Yum Gung Seafood Spicy Sour Soup', nameThai: 'ต้มยำกุ้ง - ซีฟู้ด', price: 290 },
      { name: 'Green Curry With Chicken Prawns Seafood', nameThai: 'แกงเขียวหวานไก่ / กุ้ง / ซีฟู้ด', price: '250 / 290' },
      { name: 'Massaman Curry With Chicken', nameThai: 'มัสมั่นไก่', price: 250 },
      { name: 'Steamed White Snapper With Chili Lime Sauce', nameThai: 'ปลากะพงนึ่งมะนาว', price: 690 },
      { name: 'Deep Fried White Snapper With Garlic', nameThai: 'ปลากะพงทอดกระเทียม', price: 590 },
      { name: 'Deep Fried White Snapper Topped With Spicy Herbs Salad', nameThai: 'ปลาลุยสวน', price: 490 },
      { name: 'Tom Yum Fried Rice With Prawns', nameThai: 'ข้าวผัดต้มยำกุ้ง', price: 190 },
      { name: 'Thai Southern Rice With Sweet Pork Chili Mix Green Herbs', nameThai: 'ข้าวคลุกกะปิ', price: 220 },
      { name: 'Steamed Jasmine Rice Plate', nameThai: 'ข้าวสวย (จาน)', price: 30 },
      { name: 'Steamed Jasmine Rice Bowl', nameThai: 'ข้าวสวย (โถ)', price: 90 },
      { name: 'Baked Chicken With Herbs', nameThai: 'ไก่อบสมุนไพร', price: 350 },
      { name: 'Coconut Galanga Soup With Chicken Prawns Seafood', nameThai: 'ต้มข่าไก่/กุ้ง/ซีฟู้ด', price: '250/290' },
      { name: 'Coconut Milk Soup With Prawns Bitter Green Beans And Coconut Shoots', nameThai: 'แกงเผ็ดกุ้ง', price: 290 },
      { name: 'Coconut Milk Soup With Prawns And Local Vegetables', nameThai: 'แกงคั่วกุ้งผักรวม', price: 290 },
      { name: 'Pineapple Red Curry With Pork or Prawns', nameThai: 'แกงคั่วสับปะรดหมู/กุ้ง', price: '250/290' },
      { name: 'Sour Curry With Fish And Coconut Shoots', nameThai: 'แกงส้มปลา', price: 290 },
      { name: 'Herbal Sour Clear Soup With Sea Bass Belly', nameThai: 'ต้มแซ่บพุงปลากะพง', price: 390 },
      { name: 'Steamed Squids With Chili Lime Sauce', nameThai: 'ปลาหมึกนึ่งมะนาว', price: 290 },
      { name: 'Spicy Dried Crispy Shrimps With Mango Salad', nameThai: 'ยำกุ้งแห้งมะม่วง', price: 250 },
      { name: 'Spicy Seafood With Glass Noodles Salad', nameThai: 'ยำวุ้นเส้นทะเล', price: 290 },
      { name: 'Mixed Fruits Salad', nameThai: 'ยำผลไม้รวม', price: 190 },
      { name: 'Crispy Fish With Mango Salad', nameThai: 'ยำปลาดุกฟู', price: 250 },
      { name: 'Roasted Pork Belly With Shrimp Paste', nameThai: 'หมูสามชั้นทอด', price: 250 },
      { name: 'Stir Fried Pork or Prawns With Bitter Green Beans In Shrimp Paste', nameThai: 'ผัดพริกแกงถั่วฝักยาว', price: '190/250' },
      { name: 'Stir Fried Pork or Prawns With Bitter Green Beans In Red Curry', nameThai: 'ผัดเผ็ดถั่วฝักยาว', price: '190/250' },
      { name: 'Stir Fried Mixed Vegetables With Oyster Sauce', nameThai: 'ผัดผักรวม', price: 190 },
      { name: 'Stir Fried Chicken or Prawns With Cashew Nuts', nameThai: 'ไก่/กุ้งผัดเม็ดมะม่วงหิมพานต์', price: '220/290' },
      { name: 'Stir Fried Bitter Green Beans With Glass Noodles', nameThai: 'ผัดวุ้นเส้นถั่วฝักยาว', price: 190 },
      { name: 'Stir Fried Vegetables With Crispy Pork', nameThai: 'ผัดผักหมูกรอบ', price: 220 },
      { name: 'Stir Fried Sweet And Sour Chicken or Prawns', nameThai: 'ผัดเปรี้ยวหวานไก่/กุ้ง', price: '220/290' },
      { name: 'Stir Fried Local Green Vegetables With Egg or Dried Shrimps', nameThai: 'ผัดผักพื้นบ้านไข่/กุ้งแห้ง', price: '150/190' },
      { name: 'Stir Fried Broccoli With Prawns', nameThai: 'บร็อคโคลี่ผัดกุ้ง', price: 290 },
      { name: 'Stir Fried Hongkong Kale With Oyster Sauce', nameThai: 'ผัดคะน้าฮ่องกง', price: 190 },
    ]
  },
  {
    id: 'western',
    name: 'Western',
    folderName: 'Western',
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
      { name: 'Angel Hair Pasta With Crispy Bacon Garlic Chili', nameThai: 'พาสต้าแองเกิลแฮร์', price: 350 },
      { name: 'Norwegian Salmon Steak Served With Pomelo Salad', nameThai: 'สเต็กปลาแซลมอนเสิร์ฟคู่กับยำส้มโอ', price: 390 },
      { name: 'Tuna Steak Served With Mango Salad', nameThai: 'สเต็กทูน่าเสิร์ฟคู่กับมะม่วงสลัด', price: 490 },
      { name: 'Fish And Chips', nameThai: 'ฟิชแอนด์ชิปส์', price: 390 },
      { name: 'Australian Tenderloin Steak With Grilled Vegetables And Potatoes', nameThai: 'สเต็กเนื้อ เสิร์ฟคู่กับผักย่างและมันฝรั่งทอด', price: 890 },
      { name: 'Australian Sirloin Steak Braised In Konbu Seaweed With Buttered Mash', nameThai: 'พายเนื้อวัว / Umami Konbu Beef Pie', price: 450 },
      { name: 'Pork Chop With Grilled Vegetables Served With Pepper Sauce', nameThai: 'พอร์คชอป เสิร์ฟคู่กับผักย่าง', price: 590 },
    ]
  },
  {
    id: 'bali',
    name: 'Bali',
    folderName: 'Bali',
    icon: Leaf,
    items: [
      { name: 'Inspired Braised Lamb Shank', nameThai: 'ขาแกะเคี่ยวซอสสไตล์กีลีมานุก', price: 450 },
      { name: 'Signature BBQ Spare Ribs', nameThai: 'ซี่โครงหมูย่างสูตรต้นตำรับนอตี้นูรี้ส์ปี 1999', price: 550 },
      { name: 'Devilish Cheese Poky Nachos', nameThai: 'นาโชส์หมูชีสขาเลาะ', price: 290 },
      { name: 'Nasi Goreng Fried Rice With Roasted Pork', nameThai: 'นาสิโกเร็ง ข้าวผัดสไตล์อินโด', price: 250 },
      { name: 'Mee Goreng Basah Fried Noodles With Roasted Pork', nameThai: 'หมี่โกเร็งหมี่ผัดสไตล์อินโด', price: 250 },
      { name: 'The Notorious Beef Short Ribs', nameThai: 'เนื้อซี่โครงวัวผัดเครื่องแกงสไตล์บาหลี', price: 550 },
    ]
  },
  {
    id: 'japanese',
    name: 'Japanese',
    folderName: 'Japanese',
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
    folderName: 'Vegetarian',
    icon: Leaf,
    items: [
      { name: 'Mixed Salad', nameThai: 'สลัดผักรวม', price: 250 },
      { name: 'Deep Fried Vegetables Spring Rolls', nameThai: 'ปอเปี๊ยะไส้ผัก', price: 150 },
      { name: 'Stir Fried Mixed Vegetables With Oyster Sauce', nameThai: 'ผัดผักรวม', price: 190 },
      { name: 'Corn On The Cob', nameThai: 'ข้าวโพดย่าง', price: 90 },
      { name: 'Enoki Mushroom And Potato Stir Fried In Butter', nameThai: 'เห็ดเข็มทองผัดเนย', price: 150 },
      { name: 'Spicy Crispy Banana Blossom Salad', nameThai: 'ยำหัวปลีกรอบ', price: 190 },
    ]
  },
  {
    id: 'kids',
    name: 'Kids',
    folderName: 'Kids',
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
    folderName: 'Desserts',
    icon: IceCream,
    items: [
      { name: 'Poached Banana In Syrup Served With Coconut Ice Cream', nameThai: 'กล้วยไข่เชื่อมเสิร์ฟกับไอศกรีมกะทิ', price: 190 },
      { name: 'Monkeys Banana Balls Served With Vanilla Ice Cream', nameThai: 'กล้วยซ่อนรูป', price: 250 },
      { name: 'Homemade Poached Banana In Sweet Coconut Milk', nameThai: 'กล้วยบวดชีมะพร้าวอ่อน', price: 80 },
      { name: 'Thai Traditional Sticky Rice With Fresh Mango Served With Coconut Milk', nameThai: 'ข้าวเหนียวมะม่วง', price: 190 },
      { name: 'Creme Brulee Served In A Coconut', nameThai: 'ครีมบลูเล่ในลูกมะพร้าว', price: 250 },
      { name: 'Chocolate Fondant Served With Vanilla Ice Cream', nameThai: 'ช็อกโกแลตฟองดอง', price: 270 },
      { name: 'Mix Taros In Sweet Coconut Milk', nameThai: 'บัวลอยเผือก', price: 80 },
      { name: 'Mix Fruit Seasonal', nameThai: 'ผลไม้รวม', price: 170 },
      { name: 'Coconut Ice Cream Served In Fresh Coconut', nameThai: 'ไอศกรีมกะทิเสิร์ฟในลูกมะพร้าว', price: 190 },
      { name: 'Banana Split', nameThai: 'บานานาสปลิต', price: 230 },
      { name: 'Chocolate Sundae', nameThai: 'ช็อกโกแลตซันเดย์', price: 230 },
      { name: 'Strawberry Sundae', nameThai: 'สตรอว์เบอร์รี่ซันเดย์', price: 230 },
      { name: 'Vanilla Sundae', nameThai: 'วนิลาซันเดย์', price: 230 },
      { name: 'Brownie Nutella Served With One Scoop Of Vanilla Ice Cream', nameThai: 'บราวนี่นูเทลล่า', price: 280 },
      { name: 'Honey Toast Served With One Scoop Of Vanilla Ice Cream', nameThai: 'ฮันนี่โทสต์', price: 250 },
      { name: 'Caramel Honey Toast Served With One Scoop Of Caramel Ice Cream', nameThai: 'คาราเมลฮันนี่โทสต์', price: 280 },
      { name: 'Strawberry Honey Toast Served With One Scoop Of Strawberry Ice Cream', nameThai: 'สตรอว์เบอร์รี่ฮันนี่โทสต์', price: 280 },
      { name: 'Chocolate Honey Toast Served With One Scoop Of Chocolate Ice Cream', nameThai: 'ช็อกโกแลตฮันนี่โทสต์', price: 280 },
    ]
  },
];

const drinkCategories: MenuCategory[] = [
  {
    id: 'all-drinks',
    name: 'All Drinks',
    folderName: '',
    icon: Wine,
    items: [] // Will be populated dynamically
  },
  {
    id: 'three-monkeys-tea',
    name: 'Three Monkeys Tea',
    folderName: 'Three Monkeys Tea',
    icon: Leaf,
    items: [
      { name: 'Cascara Cinnamon', nameThai: 'ชาเปลือกกาแฟอบเชย', price: 150 },
      { name: 'Ginger', nameThai: 'ชาขิง', price: 150 },
      { name: 'Coffee Blossom', nameThai: 'ชาดอกกาแฟ', price: 150 },
      { name: 'Rose', nameThai: 'ชากุหลาบ', price: 150 },
    ]
  },
  {
    id: 'signature-coffee',
    name: 'Signature Coffee',
    folderName: 'Signature Coffee',
    icon: Coffee,
    items: [
      { name: 'Drip Coffee', nameThai: 'ดริปกาแฟ', price: 120 },
      { name: 'Cold Brew', nameThai: 'โคลด์บรูว์', price: 140 },
      { name: 'Espresso Coconut', nameThai: 'เอสเพรสโซ่มะพร้าว', price: 160 },
      { name: 'Espresso Ginger', nameThai: 'เอสเพรสโซ่ขิง', price: 150 },
      { name: 'Coconut Smoothie Coffee', nameThai: 'กาแฟปั่นมะพร้าว', price: 170 },
      { name: 'Banana Coldbrew', nameThai: 'โคลด์บรูว์กล้วย', price: 160 },
      { name: 'Three Monkeys Affogato', nameThai: 'อโฟกาโต้', price: 180 },
      { name: 'Three Monkeys Frappe', nameThai: 'ปั่นกาแฟ', price: 170 },
    ]
  },
  {
    id: 'classic-coffee',
    name: 'Classic Coffee',
    folderName: 'Classic Coffee',
    icon: Coffee,
    items: [
      { name: 'Espresso', nameThai: 'เอสเพรสโซ่', price: 90 },
      { name: 'Americano', nameThai: 'อเมริกาโน่', price: 100 },
      { name: 'Cappuccino', nameThai: 'คาปูชิโน่', price: 120 },
      { name: 'Latte', nameThai: 'ลาเต้', price: 130 },
      { name: 'Mocha', nameThai: 'มอคค่า', price: 140 },
    ]
  },
  {
    id: 'fun-flavoured-coffee',
    name: 'Fun Flavoured Coffee',
    folderName: 'Fun Flavoured Coffee',
    icon: Coffee,
    items: [
      { name: 'Lime Cold Brew', nameThai: 'โคลด์บรูว์มะนาว', price: 150 },
      { name: 'Pineapple Espresso', nameThai: 'เอสเพรสโซ่สับปะรด', price: 150 },
      { name: 'Lychee Coffee', nameThai: 'กาแฟลิ้นจี่', price: 150 },
      { name: 'Orange Espresso', nameThai: 'เอสเพรสโซ่ส้ม', price: 150 },
    ]
  },
  {
    id: 'non-coffee',
    name: 'Non Coffee',
    folderName: 'Non Coffee',
    icon: GlassWater,
    items: [
      { name: 'Chocolate', nameThai: 'ช็อกโกแลต', price: 130 },
      { name: 'Mint Choco', nameThai: 'มินต์ช็อกโก', price: 140 },
      { name: 'Caramel', nameThai: 'คาราเมล', price: 130 },
      { name: 'Caramel Choco', nameThai: 'คาราเมลช็อกโก', price: 140 },
      { name: 'Thai Milk Tea', nameThai: 'ชาไทย', price: 100 },
      { name: 'Thai Lemon Tea', nameThai: 'ชามะนาว', price: 100 },
      { name: 'Thai Green Tea', nameThai: 'ชาเขียว', price: 100 },
      { name: 'Black Sesame', nameThai: 'งาดำ', price: 120 },
    ]
  },
  {
    id: 'signature-juices',
    name: 'Signature Juices',
    folderName: 'Signature Juices',
    icon: GlassWater,
    items: [
      { name: 'Pineapple Basil', nameThai: 'สับปะรดโหระพา', price: 140 },
      { name: 'Lychee Apple', nameThai: 'ลิ้นจี่แอปเปิ้ล', price: 150 },
      { name: 'Sugarcane Ginger', nameThai: 'น้ำอ้อยขิง', price: 130 },
    ]
  },
  {
    id: 'fresh-juices',
    name: 'Fresh Juices',
    folderName: 'Juices',
    icon: GlassWater,
    items: [
      { name: 'Fresh Coconut', nameThai: 'น้ำมะพร้าว', price: 80 },
      { name: 'Fresh Squeezed Orange', nameThai: 'น้ำส้มคั้นสด', price: 100 },
      { name: 'Fresh Squeezed Lime', nameThai: 'น้ำมะนาวคั้นสด', price: 80 },
      { name: 'Fresh Pineapple', nameThai: 'น้ำสับปะรด', price: 100 },
      { name: 'Fresh Sugarcane', nameThai: 'น้ำอ้อย', price: 80 },
    ]
  },
  {
    id: 'smoothies',
    name: 'Signature Smoothies',
    folderName: 'Signature Smoothies',
    icon: GlassWater,
    items: [
      { name: 'Three Monkeys Smoothie', nameThai: 'สมูทตี้ทรีมังกี้ส์', price: 150 },
      { name: 'Aloha Coco', nameThai: 'อโลฮ่ามะพร้าว', price: 140 },
      { name: 'Tamarind', nameThai: 'มะขาม', price: 130 },
      { name: 'Banana Choco', nameThai: 'กล้วยช็อกโก', price: 140 },
    ]
  },
  {
    id: 'fruit-shakes',
    name: 'Fruit Shakes',
    folderName: 'Fruit Shakes',
    icon: GlassWater,
    items: [
      { name: 'Mango', nameThai: 'มะม่วง', price: 120 },
      { name: 'Coconut', nameThai: 'มะพร้าว', price: 100 },
      { name: 'Pineapple', nameThai: 'สับปะรด', price: 100 },
      { name: 'Watermelon', nameThai: 'แตงโม', price: 90 },
      { name: 'Orange', nameThai: 'ส้ม', price: 100 },
      { name: 'Lime', nameThai: 'มะนาว', price: 90 },
      { name: 'Honey Lemon', nameThai: 'น้ำผึ้งมะนาว', price: 100 },
      { name: 'Passionfruit', nameThai: 'เสาวรส', price: 110 },
    ]
  },
  {
    id: 'milkshakes',
    name: 'Milkshakes',
    folderName: 'Milkshakes',
    icon: GlassWater,
    items: [
      { name: 'Rich Chocolate Dream', nameThai: 'มิลค์เชคช็อกโกแลต', price: 130 },
      { name: 'Mint Choco', nameThai: 'มิลค์เชคมินต์ช็อกโก', price: 140 },
      { name: 'Strawberry', nameThai: 'มิลค์เชคสตรอว์เบอร์รี่', price: 130 },
      { name: 'Caramel Sea Salt', nameThai: 'มิลค์เชคคาราเมลเกลือทะเล', price: 140 },
    ]
  },
  {
    id: 'signature-cocktails',
    name: 'Signature Cocktails',
    folderName: 'Signature Cocktails',
    icon: Martini,
    items: [
      { name: 'Kan-harb', nameThai: 'กันหาบ', price: 320 },
      { name: 'Keng', nameThai: 'เก่ง', price: 290 },
      { name: 'Muak-san', nameThai: 'หมวกสาน', price: 280 },
    ]
  },
  {
    id: 'classic-cocktails',
    name: 'Classic Cocktails',
    folderName: 'Classic Cocktails',
    icon: Martini,
    items: [
      { name: 'Mojito', nameThai: 'โมฮีโต้', price: 250 },
      { name: 'Nigroni', nameThai: 'เนโกรนี่', price: 280 },
      { name: 'Pina Colada', nameThai: 'ปิน่าโคลาด้า', price: 260 },
    ]
  },
  {
    id: 'mocktails',
    name: 'Mocktails',
    folderName: 'Mocktails',
    icon: Wine,
    items: [
      { name: 'Cane Kingdom', nameThai: 'อาณาจักรอ้อย', price: 150 },
      { name: 'Melon Bay', nameThai: 'เมลอนเบย์', price: 150 },
      { name: 'Forbidden Fruit', nameThai: 'ผลไม้ต้องห้าม', price: 140 },
      { name: 'Mango Queen', nameThai: 'มะม่วงควีน', price: 150 },
    ]
  },
  {
    id: 'signature-soda',
    name: 'Signature Soda',
    folderName: 'Signature Soda',
    icon: GlassWater,
    items: [
      { name: 'Pineapple Coconut', nameThai: 'สับปะรดมะพร้าว', price: 120 },
      { name: 'Super Berry', nameThai: 'ซูเปอร์เบอร์รี่', price: 130 },
      { name: 'Tamarind', nameThai: 'มะขาม', price: 110 },
      { name: 'Strawberry Basil', nameThai: 'สตรอว์เบอร์รี่โหระพา', price: 120 },
    ]
  },
  {
    id: 'soda',
    name: 'Soft Drinks & Soda',
    folderName: 'Soda',
    icon: GlassWater,
    items: [
      { name: 'Passionfruit', nameThai: 'เสาวรส', price: 80 },
      { name: 'Lime Mint', nameThai: 'มะนาวมินต์', price: 80 },
      { name: 'Honey Lemon', nameThai: 'น้ำผึ้งมะนาว', price: 80 },
    ]
  },
];

const getImagePaths = (itemName: string, folderName: string, isFood: boolean): string[] => {
  const basePath = isFood ? '/images/three_monkeys_menu/FOODS' : '/images/three_monkeys_menu/Drinks';
  return [
    `${basePath}/${folderName}/${itemName}.jpg`,
    `${basePath}/${folderName}/${itemName}.png`,
  ];
};

// Helper to get all items with their source category info
type MenuItemWithSource = MenuItem & { sourceCategory: string; sourceFolderName: string };

const getAllFoodItems = (): MenuItemWithSource[] => {
  return foodCategories
    .filter(c => c.id !== 'all-food')
    .flatMap(c => c.items.map(item => ({ 
      ...item, 
      sourceCategory: c.id,
      sourceFolderName: c.folderName 
    })));
};

const getAllDrinkItems = (): MenuItemWithSource[] => {
  return drinkCategories
    .filter(c => c.id !== 'all-drinks')
    .flatMap(c => c.items.map(item => ({ 
      ...item, 
      sourceCategory: c.id,
      sourceFolderName: c.folderName 
    })));
};

export default function MenuPage() {
  const t = useTranslations('menuPage');
  const [activeTab, setActiveTab] = useState<'food' | 'drinks'>('food');
  const [activeCategory, setActiveCategory] = useState('all-food');
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});

  // Helper to get translated category name
  const getCategoryName = (id: string): string => {
    const categoryKeyMap: Record<string, string> = {
      'all-food': 'allFood',
      'recommend': 'recommend',
      'thai': 'thai',
      'western': 'western',
      'bali': 'bali',
      'japanese': 'japanese',
      'vegetarian': 'vegetarian',
      'kids': 'kids',
      'desserts': 'desserts',
      'all-drinks': 'allDrinks',
      'three-monkeys-tea': 'threeMonkeysTea',
      'signature-coffee': 'signatureCoffee',
      'classic-coffee': 'classicCoffee',
      'fun-flavoured-coffee': 'funFlavouredCoffee',
      'non-coffee': 'nonCoffee',
      'signature-juices': 'signatureJuices',
      'fresh-juices': 'freshJuices',
      'smoothies': 'signatureSmoothies',
      'fruit-shakes': 'fruitShakes',
      'milkshakes': 'milkshakes',
      'signature-cocktails': 'signatureCocktails',
      'classic-cocktails': 'classicCocktails',
      'mocktails': 'mocktails',
      'signature-soda': 'signatureSoda',
      'soda': 'softDrinks',
    };
    const key = categoryKeyMap[id];
    if (key) {
      try {
        return t(`categories.${key}`);
      } catch {
        return id;
      }
    }
    return id;
  };

  const categories = activeTab === 'food' ? foodCategories : drinkCategories;
  const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];
  
  // Get all items for "All" categories
  const allFoodItems = getAllFoodItems();
  const allDrinkItems = getAllDrinkItems();

  const handleTabChange = (tab: 'food' | 'drinks') => {
    setActiveTab(tab);
    setActiveCategory(tab === 'food' ? 'all-food' : 'all-drinks');
  };

  const handleImageError = (imageKey: string, currentIndex: number, maxIndex: number) => {
    if (currentIndex < maxIndex - 1) {
      setImageIndices(prev => ({ ...prev, [imageKey]: currentIndex + 1 }));
    } else {
      setImageIndices(prev => ({ ...prev, [imageKey]: -1 }));
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/new/threemonkeys009.jpg"
            alt="Menu"
            fill
            className="object-cover opacity-60"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#b1b94c]/10 border border-[#b1b94c]/20 rounded-full text-[#b1b94c] text-sm font-medium mb-6">
              <Utensils className="w-4 h-4" />
              {t('badge')}
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case">
              {t('headline').split(' ').slice(0, -1).join(' ')} <span className="text-[#b1b94c]">{t('headline').split(' ').slice(-1)}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-[family-name:var(--font-inter)]">
              {t('description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Tabs */}
      <section className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10">
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
              {t('tabFood')}
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
              {t('tabDrinks')}
            </button>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="bg-[#111]/95 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 py-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-[#b1b94c]/20 text-[#b1b94c] border border-[#b1b94c]/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                <category.icon className="w-3.5 h-3.5" />
                {getCategoryName(category.id)}
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
                    {getCategoryName(currentCategory.id)}
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    {t('itemsCount', { count: (() => {
                      const isAllCategory = activeCategory === 'all-food' || activeCategory === 'all-drinks';
                      const items = isAllCategory 
                        ? (activeTab === 'food' ? allFoodItems : allDrinkItems)
                        : currentCategory.items.map(item => ({ 
                            ...item, 
                            sourceCategory: currentCategory.id, 
                            sourceFolderName: currentCategory.folderName 
                          } as MenuItemWithSource));
                      // Count only items with valid images
                      const validCount = items.filter((item) => {
                        const imageKey = `${(item as MenuItemWithSource).sourceCategory || currentCategory.id}-${item.name}`;
                        return (imageIndices[imageKey] ?? 0) !== -1;
                      }).length;
                      return validCount;
                    })() })}
                  </p>
                </div>
              </div>

              {/* Menu Grid with Images */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  // Determine items to display
                  const isAllCategory = activeCategory === 'all-food' || activeCategory === 'all-drinks';
                  const itemsToDisplay = isAllCategory 
                    ? (activeTab === 'food' ? allFoodItems : allDrinkItems)
                    : currentCategory.items.map(item => ({ 
                        ...item, 
                        sourceCategory: currentCategory.id, 
                        sourceFolderName: currentCategory.folderName 
                      } as MenuItemWithSource));
                  
                  // Filter items to only show those with valid images (not failed)
                  const filteredItems = itemsToDisplay.filter((item) => {
                    const imageKey = `${(item as MenuItemWithSource).sourceCategory || currentCategory.id}-${item.name}`;
                    const currentImageIndex = imageIndices[imageKey] ?? 0;
                    // Only include items where image hasn't explicitly failed (-1)
                    return currentImageIndex !== -1;
                  });
                  
                  return filteredItems.map((item, index) => {
                    const folderName = (item as MenuItemWithSource).sourceFolderName || currentCategory.folderName;
                    const imagePaths = getImagePaths(item.name, folderName, activeTab === 'food');
                    const imageKey = `${(item as MenuItemWithSource).sourceCategory || currentCategory.id}-${item.name}`;
                    const currentImageIndex = imageIndices[imageKey] ?? 0;
                    
                    return (
                      <motion.div
                        key={`${imageKey}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.5) }}
                        className="group bg-[#111] rounded-2xl border border-white/5 hover:border-[#b1b94c]/30 transition-all overflow-hidden"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] bg-[#1a1a1a] overflow-hidden">
                          <Image
                            src={imagePaths[currentImageIndex]}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() => handleImageError(imageKey, currentImageIndex, imagePaths.length)}
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {/* Price Badge */}
                          <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-full border border-white/10">
                            <span className="text-[#b1b94c] font-[family-name:var(--font-krona)] text-sm">
                              ฿{item.price}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-white font-medium text-base leading-snug mb-1 group-hover:text-[#b1b94c] transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                          {item.nameThai && (
                            <p className="text-white/40 text-sm line-clamp-1">
                              {item.nameThai}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Tax Notice */}
          <div className="mt-12 p-6 bg-[#111] rounded-2xl border border-white/10 text-center">
            <p className="text-white/50 text-sm font-[family-name:var(--font-inter)]">
              {t('taxNotice')}
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
              {t('ctaTitle')}
            </h2>
            <p className="text-white/60 text-lg mb-10 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              {t('ctaDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <button className="inline-flex items-center gap-3 px-10 py-4 bg-[#b1b94c] text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-[#c4cc5a] transition-all">
                  {t('ctaReserve')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/special-packages">
                <button className="inline-flex items-center gap-2 px-10 py-4 border border-white/20 text-white font-[family-name:var(--font-krona)] rounded-full hover:bg-white hover:text-black transition-all">
                  {t('ctaPackages')}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
