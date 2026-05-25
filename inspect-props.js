const fs = require('fs');

const html = fs.readFileSync('full-page.html', 'utf8');
const nextDataMatch = html.match(/<script id=\"__NEXT_DATA__\" type=\"application\/json\">([\s\S]*?)<\/script>/);
if (nextDataMatch) {
    const json = JSON.parse(nextDataMatch[1]);
    console.log('Page Props Keys:', Object.keys(json.props.pageProps));
    console.log('--- FULL PAGE PROPS ---');
    console.log(JSON.stringify(json.props.pageProps, null, 2));
} else {
    console.log('NEXT_DATA not found');
}
