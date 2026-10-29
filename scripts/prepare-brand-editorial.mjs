// Builds local, reviewable CMS payloads only. It never connects to a database.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {marked} from 'marked';
const root='docs/brand-optimization';
const sourceRoot='public/images/';
const food=sourceRoot+'three_monkeys_menu/FOODS/';
const uuid=value=>{const h=createHash('sha256').update('three-monkeys-editorial:'+value).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;};
const allocation={
 'getting-to-three-monkeys-phuket':[
  [sourceRoot+'new/threemonkeys001.jpg','three-monkeys-sign','Illuminated Three Monkeys sign surrounded by greenery at night','The restaurant name helps identify the destination inside Hanuman World.'],
  [sourceRoot+'new/threemonkeys031.jpg','restaurant-walkway','Wooden walkway between dining tables beneath trees and hanging lights','Consider the route to your chosen table when discussing access needs.'],
  [sourceRoot+'new/threemonkeys049.jpg','restaurant-building-night','Curving illuminated restaurant roof and glass-fronted dining space at night','An evening exterior view of Three Monkeys.']],
 'thai-soups-three-monkeys-phuket':[
  [food+'Thai/Coconut Galanga Soup With Chicken Prawns Seafood.jpg','coconut-galanga-soup','Coconut galanga soup with prawns, squid, mushrooms and herbs','The menu lists coconut galanga soup with a choice of chicken, prawns or seafood.'],
  [food+'Thai/Coconut Milk Soup With Prawns And Local Vegetables.jpg','prawn-local-vegetable-soup','Prawns and leafy vegetables in a bowl of coconut milk soup','A separate coconut soup on the menu combines prawns and local vegetables.'],
  [food+'Thai/Herbal Sour Clear Soup With Sea Bass Belly.jpg','herbal-sea-bass-soup','Clear soup with sea bass, red chillies and herbs in a green bowl','Herbal sour clear soup offers a different starting point from the coconut-based choices.']],
 'dietary-requests-three-monkeys-phuket':[
  [food+'Vegetarian/Deep Fried Vegetables Spring Rolls.jpg','vegetable-spring-rolls','Vegetable spring rolls cut open on a green plate beside dipping sauce','Ask about fillings, wrappers, sauces and preparation rather than relying on the dish name alone.'],
  [food+'Japanese/Edamame.jpg','edamame-bowl','Green edamame pods in a bowl with chopsticks on a bamboo mat','The Japanese menu includes edamame; confirm preparation for your requirements.'],
  [food+'Vegetarian/Corn On The Cob.jpg','corn-on-cob','Grilled corn pieces with wooden picks in a brown bowl','Check toppings and preparation when ordering a side dish.']],
 'hanuman-world-and-three-monkeys-dining':[
  [sourceRoot+'new/threemonkeys034.jpg','bamboo-dining-pavilion','Bamboo dining pavilion with hanging lanterns and trees at dusk','The dining setting can be part of the day without assuming an activity is included.'],
  [sourceRoot+'new/threemonkeys013.jpg','monkey-tree-sculpture','Decorative monkey sculpture attached to a tree in the restaurant','A distinctive detail within the Three Monkeys setting.'],
  [sourceRoot+'new/threemonkeys048.jpg','illuminated-canopy-building','Illuminated Three Monkeys building surrounded by dense trees at night','Plan the restaurant reservation separately from any activity arrangements.']]
};
const old=Object.values(JSON.parse(fs.readFileSync('docs/blog-content/images.json','utf8'))).flat();
const newMedia=[];const ledger=[];const manifest={};
fs.mkdirSync(root+'/articles',{recursive:true});fs.mkdirSync('public/images/editorial',{recursive:true});fs.mkdirSync('docs/verification/brand',{recursive:true});
for(const [slug,items] of Object.entries(allocation)){
 manifest[slug]=[];
 for(const [source,name,alt,caption] of items){
  const bytes=fs.readFileSync(source);const hash=createHash('sha256').update(bytes).digest('hex');
  if([...old,...newMedia].some(m=>m.source_hash===hash))throw Error('Duplicate source '+source);
  const raw=await sharp(bytes).rotate().resize(16,16,{fit:'fill'}).greyscale().raw().toBuffer();
  const mean=raw.reduce((a,b)=>a+b,0)/raw.length;const fingerprint=[...raw].map(v=>v>mean?'1':'0').join('');
  const close=[...old,...newMedia].filter(m=>m.fingerprint&&[...fingerprint].filter((x,i)=>x!==m.fingerprint[i]).length<15);
  if(close.length)throw Error('Potential visual repeat '+source+' with '+close.map(m=>m.source_name).join(','));
  const variants=[];
  for(const size of [480,960,1600]){
   const dest=`/images/editorial/${name}-${size}.webp`;
   let info;
   for(const quality of [78,70,62,54]){
    info=await sharp(bytes).rotate().resize(Math.min(size,1200),Math.min(size,1200),{fit:'inside',withoutEnlargement:true}).webp({quality,effort:5}).toFile('public'+dest);
    if(info.size<=250000)break;
   }
   if(info.size>250000)throw Error('Image too large '+dest);
   variants.push({src:dest,width:info.width});
  }
  const dims=await sharp('public'+variants[2].src).metadata();
  const media={id:uuid('image:'+hash),src:variants[2].src,source_hash:hash,fingerprint,source_name:source,width:dims.width,height:dims.height,variants,alt,caption,generated:false};
  newMedia.push(media);manifest[slug].push(media);
  ledger.push({source_url:'https://threemonkeysphuket.com/'+source.replace(/^public\//,''),filename:source,sha256:hash,fingerprint,visual_description:alt,verified_on:'2026-10-29',destination:'website article',article_slug:slug,role:manifest[slug].length===1?'hero':'body',status:'prepared',media_id:media.id,history_limitation:'Compared against all 25 registered existing article sources and this batch by exact hashes and perceptual similarity, with visual inspection. Historic GBP/social media uses are not fully accessible.'});
 }
}
const posts=[];
for(const f of fs.readdirSync(root+'/articles').filter(f=>f.endsWith('.md')).sort()){
 const raw=fs.readFileSync(root+'/articles/'+f,'utf8');const split=raw.indexOf('\n');const meta=JSON.parse(raw.slice(0,split));const media=manifest[meta.slug];if(!media)throw Error('No media allocation '+f);
 const content=await marked.parse(raw.slice(split+1).replace(/\{\{image:(\d+)\}\}/g,(_,n)=>`<img src="${media[n].src}" alt="${media[n].alt}" width="${media[n].width}" height="${media[n].height}">`));
 const publicMedia=media.map(({id,src,width,height,variants,alt,caption,generated})=>({id,src,width,height,variants,alt,caption,generated}));
 posts.push({id:uuid('article:'+meta.slug),...meta,content,featured_image:media[0].src,image_manifest:publicMedia,author:'Three Monkeys Team',status:'published'});
}
fs.writeFileSync(root+'/article-assets.json',JSON.stringify(ledger,null,2)+'\n');
fs.writeFileSync(root+'/article-media.json',JSON.stringify(newMedia,null,2)+'\n');
fs.writeFileSync('docs/verification/brand/article-payloads.json',JSON.stringify(posts,null,2)+'\n');
console.log(`Prepared ${posts.length} CMS articles and ${newMedia.length} distinct media records. No publication performed.`);
