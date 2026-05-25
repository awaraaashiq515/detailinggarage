const axios = require('axios');
const fs = require('fs');

async function findKey() {
    try {
        // Step 1: Find the JS file URL from the HTML
        const html = fs.readFileSync('full-page.html', 'utf8');
        const match = html.match(/\/_next\/static\/chunks\/pages\/rc-details\/\[rc\]-[a-z0-9]+\.js/);
        if (!match) return console.log('JS file not found in HTML');

        const jsUrl = `https://www.carinfo.app${match[0]}`;
        console.log('Fetching JS:', jsUrl);

        const res = await axios.get(jsUrl);
        const js = res.data;

        // Step 2: Search for potential decryption markers
        const markers = ['decrypt', 'CryptoJS', 'AES', 'U2FsdGVkX1', 'salt', 'key'];
        markers.forEach(m => {
            const index = js.indexOf(m);
            if (index !== -1) {
                console.log(`Found marker "${m}" at index ${index}`);
                console.log('Context:', js.substring(index - 50, index + 100));
            }
        });

    } catch (e) {
        console.log('Error:', e.message);
    }
}

findKey();
