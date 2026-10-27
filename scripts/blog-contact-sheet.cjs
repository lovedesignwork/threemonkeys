const fs = require('fs');
const sharp = require('sharp');
const paths = [
 'by_slide/slide_05/monkey-dome01.jpg','by_slide/slide_05/monkey-dome02.jpg','by_slide/slide_05/monkey-dome03.jpg','by_slide/slide_05/monkey-dome04.jpg',
 'by_slide/slide_10/monkeynest1.jpg','by_slide/slide_10/monkeynest2.jpg','by_slide/slide_10/monkeynest3.jpg',
 'by_slide/slide_20/zone7romantic1.jpg','by_slide/slide_20/zone7romantic2.jpg','by_slide/slide_20/zone7romantic3.jpg',
 'by_slide/slide_15/bamboopav1.jpg','by_slide/slide_15/bamboopav2.jpg',
 'by_slide/slide_45/indoor1.jpg','by_slide/slide_50/outdoor1.jpg','by_slide/slide_30/zone6_1.jpg',
 'Random images/47_resize.jpg','small/small-sized_16.jpg','by_slide/slide_17/pos1_BD_Mini.png',
 'by_slide/slide_07/threemonkeys_addon1.jpg','by_slide/slide_07/threemonkeys_addon2.jpg',
];
(async()=>{const tiles=[];for(let i=0;i<paths.length;i++) {const input='public/images/'+paths[i];if(!fs.existsSync(input))continue;const pic=await sharp(input).rotate().resize(280,185,{fit:'contain',background:'#222'}).png().toBuffer();tiles.push({input:pic,left:(i%4)*300,top:Math.floor(i/4)*225});tiles.push({input:Buffer.from(`<svg width="290" height="30"><rect width="290" height="30" fill="white"/><text x="6" y="20" font-size="15">${i}: ${paths[i].split('/').pop()}</text></svg>`),left:(i%4)*300,top:Math.floor(i/4)*225+185});}await sharp({create:{width:1200,height:Math.ceil(paths.length/4)*225,channels:3,background:'#eee'}}).composite(tiles).jpeg().toFile('docs/verification/blog/contact.jpg');})();
