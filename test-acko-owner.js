const axios = require('axios');
const cheerio = require('cheerio');

async function testAckoOwner(regNo) {
    try {
        console.log(`Testing Acko Owner for ${regNo}...`);
        const url = `https://www.acko.com/rto-vehicle-information/owner-details/${regNo.toLowerCase()}/`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        console.log('Title:', $('title').text());

        // Search for labels in p and span
        $('p, div, span, td').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('Registration Date')) data.registration_date = $(el).next().text().trim();
            if (text.includes('Fuel Type')) data.fuel_type = $(el).next().text().trim();
            if (text.includes('Registration Authority')) data.registration_authority = $(el).next().text().trim();
        });

        return data;
    } catch (e) {
        return { error: 'AckoOwner failed: ' + e.message };
    }
}

testAckoOwner('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
