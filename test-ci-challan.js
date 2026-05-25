const CryptoJS = require('crypto-js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function testChallan(regNo) {
    try {
        console.log(`Fetching Challan page for ${regNo}...`);
        const res = await axios.get(`https://www.carinfo.app/challan-details/${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(res.data);
        const nextData = $('#__NEXT_DATA__').html();
        if (!nextData) return console.log('No NEXT_DATA');

        const json = JSON.parse(nextData);
        // Challan props might be different
        const encrypted = json.props.pageProps.xdataprops;
        if (!encrypted) return console.log('No xdataprops on challan page');

        const key = "Gx!7m$9zK@qW2vP";
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) return console.log('Decryption failed');

        const data = JSON.parse(decrypted);
        fs.writeFileSync('challan-decrypted.json', JSON.stringify(data, null, 2));
        console.log('Saved to challan-decrypted.json');

        // Search for dates
        const str = JSON.stringify(data);
        const dates = str.match(/\d{1,2}-[A-Za-z]{3}-\d{4}/g);
        console.log('Dates found in challan data:', dates);

    } catch (e) {
        console.log('Error:', e.message);
    }
}

testChallan('HR55AP0244');
