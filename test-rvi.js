const axios = require('axios');
const cheerio = require('cheerio');

async function testRtoInfo(regNo) {
    try {
        console.log(`Testing RtoInfo for ${regNo}...`);
        const url = `https://rto-vehicle-information.com/vehicle-details/${regNo.toLowerCase()}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        $('.vahan-item').each((i, el) => {
            const label = $(el).find('.vahan-label').text().trim();
            const val = $(el).find('.vahan-value').text().trim();
            if (label && val) data[label] = val;
        });

        if (Object.keys(data).length === 0) {
            $('*').each((i, el) => {
                const t = $(el).text().trim();
                if (t === 'Registration Date') data.reg_date = $(el).next().text().trim();
            });
        }

        return data;
    } catch (e) {
        return { error: 'RtoInfo failed: ' + e.message, status: e.response?.status };
    }
}

testRtoInfo('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
