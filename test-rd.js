const axios = require('axios');
const cheerio = require('cheerio');

async function testRtoDetails(regNo) {
    try {
        console.log(`Testing RtoDetails for ${regNo}...`);
        const url = `https://rtodetails.info/rc-details/${regNo.toUpperCase()}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        $('.card-body div').each((i, el) => {
            const t = $(el).text().trim();
            if (t.includes('Registration Date')) data.reg_date = t.split(':')[1]?.trim();
            if (t.includes('Fuel Type')) data.fuel_type = t.split(':')[1]?.trim();
        });

        return data;
    } catch (e) {
        return { error: 'RtoDetails failed: ' + e.message, status: e.response?.status };
    }
}

testRtoDetails('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
