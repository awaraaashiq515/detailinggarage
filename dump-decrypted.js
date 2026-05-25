const CryptoJS = require('crypto-js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function testDecryption(regNo) {
    try {
        const res = await axios.get(`https://www.carinfo.app/rc-details/${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(res.data);
        const nextData = $('#__NEXT_DATA__').html();
        const json = JSON.parse(nextData);
        const encrypted = json.props.pageProps.xdataprops;
        const key = "Gx!7m$9zK@qW2vP";
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const fullData = JSON.parse(decrypted);

        fs.writeFileSync('decrypted-full.json', JSON.stringify(fullData, null, 2));
        console.log('Saved to decrypted-full.json');

    } catch (e) {
        console.log('Error:', e.message);
    }
}

testDecryption('HR55AP0244');
