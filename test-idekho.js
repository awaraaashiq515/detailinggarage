const axios = require('axios');
const cheerio = require('cheerio');

async function testInsuranceDekho(regNo) {
    try {
        const session = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive'
            },
            jar: true, // This won't work with raw axios without a cookie jar lib
            withCredentials: true
        });

        console.log(`Step 1: Visiting InsuranceDekho for ${regNo}...`);
        // Note: They often redirect to a vahan-details page
        const url = `https://www.insurancedekho.com/vahan-details/${regNo.toLowerCase()}`;
        const res = await session.get(url, {
            maxRedirects: 5,
            validateStatus: (status) => status < 400
        });

        console.log('Final URL:', res.request.res.responseUrl || url);
        console.log('Status:', res.status);

        const $ = cheerio.load(res.data);
        const data = {};

        $('table tr, .vahan-row').each((i, el) => {
            const label = $(el).find('td, .label').first().text().trim();
            const val = $(el).find('td, .value').last().text().trim();
            if (label && val) data[label] = val;
        });

        return data;
    } catch (e) {
        return { error: 'InsuranceDekho failed: ' + e.message, status: e.response?.status };
    }
}

testInsuranceDekho('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
