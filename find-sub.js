const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('full-page.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- SUBSTRING SEARCH ---');
$('*').each((i, el) => {
    const text = $(el).text();
    if (text.includes('Registration Date')) {
        console.log(`Found "Registration Date" in ${el.tagName} (index ${i})`);
        console.log(`Text content: ${text.substring(0, 100)}`);
    }
});
