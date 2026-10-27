import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {marked} from 'marked';
import {load} from 'cheerio';
const images=JSON.parse(fs.readFileSync('docs/blog-content/images.json','utf8'));
const sql=[];const posts=[];const allHashes=new Set();
const quote=v=>v==null?'null':`'${String(v).replaceAll("'","''")}'`;
const uuid=slug=>{const h=createHash('sha256').update('three-monkeys-blog:'+slug).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;};
for(const file of fs.readdirSync('docs/blog-content').filter(f=>f.endsWith('.md')).sort()){
 const raw=fs.readFileSync('docs/blog-content/'+file,'utf8');const split=raw.indexOf('\n');const meta=JSON.parse(raw.slice(0,split));const media=images[meta.slug];
 const source=raw.slice(split+1).replace(/\{\{image:(\d+)\}\}/g,(_,n)=>`<img src="${media[n].src}" alt="${media[n].alt}" width="${media[n].width}" height="${media[n].height}">`);
 const content=await marked.parse(source);const $=load(content);const words=load(content.replace(/<[^>]*>/g,' ')).text().trim().split(/\s+/).length;
 if(words<800||words>1600)throw Error(`${file}: ${words} words`);
 if($('h1').length||!$('h2').length)throw Error('Invalid headings '+file);
 if($('img').length+1!==media.length||media.length<3||media.length>5)throw Error('Invalid images '+file);
 for(const m of media){if(allHashes.has(m.source_hash))throw Error('Image reused');allHashes.add(m.source_hash);const fields=Object.keys(m);sql.push(`insert into public.blog_media (${fields.join(',')}) values (${fields.map(k=>quote(typeof m[k]==='object'?JSON.stringify(m[k]):m[k])).join(',')}) on conflict (src) do update set alt=excluded.alt,caption=excluded.caption,variants=excluded.variants,width=excluded.width,height=excluded.height;`);}
 const publicMedia=media.map(({id,src,width,height,variants,alt,caption,generated})=>({id,src,width,height,variants,alt,caption,generated}));
 const post={id:uuid(meta.slug),...meta,content,featured_image:media[0].src,image_manifest:publicMedia,author:'Three Monkeys Restaurant',status:'published',published_at:new Date(Date.UTC(2026,9,27,0,0,100-Number(file.slice(0,2)))).toISOString()};
 // The six selected articles sort ahead of the refreshed legacy stories.
 const fields=Object.keys(post);sql.push(`insert into public.blog_posts (${fields.join(',')}) values (${fields.map(k=>k==='tags'?`ARRAY[${post.tags.map(quote).join(',')}]`:quote(typeof post[k]==='object'?JSON.stringify(post[k]):post[k])).join(',')}) on conflict (slug) do update set ${fields.filter(k=>k!=='id'&&k!=='slug').map(k=>`${k}=excluded.${k}`).join(',')};`);
 posts.push(post);console.log(`${meta.slug}: ${words} words, ${media.length} images`);
}
fs.writeFileSync('docs/verification/blog/seed.sql','begin;\n'+sql.join('\n')+'\ncommit;');
fs.writeFileSync('docs/verification/blog/posts.json',JSON.stringify(posts,null,2));
