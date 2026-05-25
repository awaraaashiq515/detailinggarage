const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('full-page.html', 'utf8');
const $ = cheerio.load(html);

$('script').each((i, el) => {
    const content = $(el).html();
    const src = $(el).attr('src');
    if (src) {
        console.log(`Script ${i}: src=${src}`);
    } else if (content) {
        console.log(`Script ${i}: length=${content.length}`);
        if (content.length > 500) {
            fs.writeFileSync(`script-${i}.txt`, content);
        }
    }
});
