const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('full-page.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- ALL SCRIPT TAGS ---');
$('script').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
        console.log(`[${i}] External: ${src}`);
    } else {
        const content = $(el).html();
        console.log(`[${i}] Inline: ${content.substring(0, 100)}...`);
        if (content.includes('2019') || content.includes('PETROL')) {
            console.log('Found target text in script tag ' + i);
            fs.writeFileSync(`script-${i}.txt`, content);
        }
    }
});
