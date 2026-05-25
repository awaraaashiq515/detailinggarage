const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('full-page.html', 'utf8');
const $ = cheerio.load(html);
const nextData = $('#__NEXT_DATA__').html();

if (nextData) {
    const json = JSON.parse(nextData);
    console.log('Page Props Keys:', Object.keys(json.props.pageProps));
    fs.writeFileSync('props.json', JSON.stringify(json.props.pageProps, null, 2));
    console.log('Saved to props.json');
} else {
    console.log('NEXT_DATA not found');
}
