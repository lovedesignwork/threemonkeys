const fs=require('fs');const path=require('path');const sharp=require('sharp');const {createHash,randomUUID}=require('crypto');
const supplied='G:/My Drive/SEO JOB/From PALM/3M/';const site='public/images/';
// All variants of a source belong to exactly one article. No generated imagery.
const allocation={
 'outdoor-jungle-dining-adventure':[
 [site+'by_slide/slide_50/outdoor1.jpg','rainforest-terrace','Open dining terrace looking onto trees at Three Monkeys','The open terrace connects the dining space with the surrounding greenery.'],
 [supplied+'IMG_1823.JPG','restaurant-in-the-trees','Aerial view of the illuminated Three Monkeys building among dense trees','An evening view of the restaurant within its wooded setting.'],
 [supplied+'IMG_1818.JPG','daytime-dj-setting','DJ booth beneath an umbrella beside stone steps and tropical plants','A daytime moment photographed at the venue. Ask the team about entertainment for your visit.']],
 'best-rooftop-restaurant-phuket-romance':[
 [site+'by_slide/slide_05/monkey-dome03.jpg','monkey-dome-evening','Illuminated Monkey Dome seating surrounded by trees at night','Monkey Dome photographed in the evening; reserve the specific seating area you want.'],
 [supplied+'IMG_1825.JPG','dinner-sharing-table','Guests sharing dishes around a softly lit table','A shared meal can be the centre of a relaxed evening together.'],
 [site+'by_slide/slide_15/bamboopav1.jpg','bamboo-pavilion-evening','Bamboo pavilion with a decorated dining table and warm lighting','The Bamboo Pavilion is another seating option to discuss with the reservations team.']],
 'best-place-celebration-phuket':[
 [supplied+'IMG_1813.JPG','celebration-under-the-trees','Dining tables and balloons beneath a large tree with hanging lights','An evening celebration setting photographed at Three Monkeys.'],
 [site+'small/small-sized_16.jpg','birthday-table','Birthday table with cake and decorations in a curved seating area','A photographed birthday setup; confirm the decorations and seating included in your booking.'],
 [site+'by_slide/slide_07/threemonkeys_addon2.jpg','birthday-gathering','Guests gathered around a birthday cake in a Monkey Dome','A birthday gathering in the Dome. The seating and extras you choose should be confirmed separately.']],
 'monkey-dome-vs-monkey-nest':[
 [site+'by_slide/slide_05/monkey-dome01.jpg','monkey-dome-daylight','Rounded Monkey Dome dining structures beside a garden path','Monkey Dome in daylight, showing its rounded enclosure and garden setting.'],
 [site+'by_slide/slide_05/monkey-dome02.jpg','inside-monkey-dome','Curved red seating and a round table inside a Monkey Dome','The interior of a Monkey Dome; decoration details can vary by arrangement.'],
 [site+'by_slide/slide_10/monkeynest1.jpg','monkey-nest-decks','Curved Monkey Nest seats arranged among trees on wooden decks','Monkey Nest uses open curved seating around the trees.'],
 [site+'by_slide/slide_10/monkeynest2.jpg','monkey-nest-table','Round dining table and white cushions inside a curved Monkey Nest seat','A closer view of the table and seating arrangement in Monkey Nest.']],
 'authentic-southern-thai-food':[
 [supplied+'IMG_1819.JPG','thai-sharing-spread','Overhead view of Thai dishes with prawns, vegetables and leaf-wrapped food','A selection of dishes photographed at Three Monkeys, ready to share.'],
 [supplied+'IMG_1850.JPG','prawns-and-coconut-soup','Prawn dish in the foreground with coconut soup and vegetables on the table','Different textures and flavours make a shared meal more interesting.'],
 [site+'three_monkeys_menu/FOODS/Thai/Tom Yum Gung Seafood Spicy Sour Soup.jpg','tom-yum-seafood','Tom yum seafood soup from the Three Monkeys menu','Tom yum is one option when you want a sour and aromatic soup alongside your meal.']],
 'three-monkeys-phuket-reservations':[
 [supplied+'IMG_1842.JPG','restaurant-tables-evening','Dining room with woven lamps, wooden flooring and occupied tables','Choose your seating area before completing your reservation.'],
 [site+'by_slide/slide_45/indoor1.jpg','indoor-seating','Indoor dining tables with windows looking onto tropical greenery','Indoor seating is listed separately from the signature outdoor zones.'],
 [site+'by_slide/slide_50/outdoor2.jpg','outdoor-tables','Outdoor dining area at Three Monkeys','Check the seating description and booking terms for the area you select.']],
 'signature-drinks-three-monkeys':[
 [site+'three_monkeys_menu/Drinks/Mocktails/Mango Coco.jpg','mango-coco-mocktail','Yellow Mango Coco drink garnished with sliced mango','Mango Coco appears in the mocktail selection. Check the current menu for availability.'],
 [site+'three_monkeys_menu/Drinks/Juices/Fresh Coconut.jpg','fresh-coconut','Fresh coconut served with a straw and paper umbrella','Fresh coconut is listed in the juice selection.'],
 [site+'three_monkeys_menu/Drinks/Three Monkeys Tea/Oolong.jpg','oolong-tea','Amber iced oolong tea in a glass on a wooden tray','Oolong is one of the teas listed on the Three Monkeys menu.']],
 'three-reasons-must-visit':[
 [supplied+'IMG_1835.JPG','evening-dining-room','Dining deck beneath an illuminated tree at Three Monkeys','The dining setting changes as the trees and tables light up in the evening.'],
 [supplied+'IMG_1817.JPG','percussion-performance','Percussionist performing beside the restaurant stone steps','A performance captured at the venue; entertainment is not guaranteed for every reservation.'],
 [site+'by_slide/slide_50/outdoor3.jpg','daylight-outdoor-dining','Tables and greenery in the outdoor dining area','Build time into your visit to settle in and enjoy your chosen table.']],
};
const prior=fs.existsSync('docs/blog-content/images.json')?Object.values(JSON.parse(fs.readFileSync('docs/blog-content/images.json','utf8'))).flat():[];
(async()=>{const manifest={};const hashes=new Set();for(const [slug,items]of Object.entries(allocation)){manifest[slug]=[];for(const [source,name,alt,caption]of items){const bytes=fs.readFileSync(source);const hash=createHash('sha256').update(bytes).digest('hex');if(hashes.has(hash))throw Error('Duplicate source '+source);hashes.add(hash);const pixels=await sharp(bytes).rotate().resize(16,16,{fit:'fill'}).greyscale().raw().toBuffer();const avg=pixels.reduce((a,b)=>a+b,0)/pixels.length;const fingerprint=[...pixels].map(n=>n>=avg?'1':'0').join('');const variants=[];let info,src;for(const size of [480,960,1600]){let quality=85;let edge=size;let out;do{out=await sharp(bytes).rotate().resize({width:edge,height:edge,fit:'inside',withoutEnlargement:true}).webp({quality}).toBuffer({resolveWithObject:true});if(quality>65)quality-=5;else edge=Math.floor(edge*.9);}while(out.data.length>250000&&edge>600);src=`/images/blog/${name}-${size}.webp`;fs.writeFileSync('public'+src,out.data);info=out.info;if(!variants.some(v=>v.width===info.width))variants.push({src,width:info.width});}manifest[slug].push({id:prior.find(m=>m.source_hash===hash)?.id||randomUUID(),src,source_hash:hash,fingerprint,source_name:source,width:info.width,height:info.height,variants,alt,caption,generated:false});}console.log(slug,manifest[slug].length);}fs.writeFileSync('docs/blog-content/images.json',JSON.stringify(manifest,null,2));})();
