const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('full-page.html', 'utf8');
const $ = cheerio.load(html);
const nextData = $('#__NEXT_DATA__').html();
const json = JSON.parse(nextData);

console.log('Keys in json.props.pageProps:', Object.keys(json.props.pageProps));
for (const key of Object.keys(json.props.pageProps)) {
    const val = json.props.pageProps[key];
    console.log(`Key: ${key}, Type: ${typeof val}`);
    if (typeof val === 'string' && val.startsWith('U2FsdGVkX1')) {
        console.log(`  Looks like encrypted content: ${val.substring(0, 50)}...`);
    } else if (typeof val === 'object') {
        console.log(`  Sub-keys: ${Object.keys(val)}`);
    }
}
