const CryptoJS = require('crypto-js');
const axios = require('axios');
const cheerio = require('cheerio');

async function testDecryption(regNo) {
    try {
        const res = await axios.get(`https://www.carinfo.app/rc-details/${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(res.data);
        const nextData = $('#__NEXT_DATA__').html();
        if (!nextData) return console.log('No NEXT_DATA');

        const json = JSON.parse(nextData);
        const encrypted = json.props.pageProps.xdataprops;
        if (!encrypted) return console.log('No xdataprops');

        const key = "Gx!7m$9zK@qW2vP";
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) return console.log('Decryption failed');

        const fullData = JSON.parse(decrypted);
        const data = fullData.data; // Looking at previous output, it has 'data' key

        console.log('Keys in data.data:', Object.keys(data));

        if (data.webSections) {
            data.webSections.forEach(s => {
                console.log(`\n--- Section: ${s.title || s.type} ---`);
                if (s.rows) {
                    s.rows.forEach(r => {
                        console.log(`${r.label}: ${r.value}`);
                    });
                }
                // Some sections have a different structure
            });
        }

        if (data.meta) {
            console.log('\n--- Meta Details ---');
            console.log(JSON.stringify(data.meta, null, 2));
        }

    } catch (e) {
        console.log('Error:', e.message);
    }
}

testDecryption('HR55AP0244');
