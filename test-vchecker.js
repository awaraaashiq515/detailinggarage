const axios = require('axios');
const cheerio = require('cheerio');

async function testVahanChecker(regNo) {
    try {
        console.log(`Testing VahanChecker for ${regNo}...`);
        // Note: Sometimes the URL is slightly different
        const url = `https://vahan-checker.com/rto-vehicle-details/${regNo.toLowerCase()}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        $('table tr').each((i, el) => {
            const label = $(el).find('td').first().text().trim();
            const val = $(el).find('td').last().text().trim();
            if (label && val) data[label] = val;
        });

        return data;
    } catch (e) {
        return { error: 'VahanChecker failed: ' + e.message, status: e.response?.status };
    }
}

testVahanChecker('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
