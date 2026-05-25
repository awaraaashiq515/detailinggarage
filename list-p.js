const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('full-page.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- ALL P TAGS ---');
$('p').each((i, el) => {
    console.log(`[${i}] ${$(el).text().trim()}`);
});
