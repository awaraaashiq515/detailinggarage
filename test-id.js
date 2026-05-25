const axios = require('axios');
const cheerio = require('cheerio');

async function testInsuranceDekho(regNo) {
    try {
        console.log(`Testing InsuranceDekho for ${regNo}...`);
        // Note: URL might be insurance-check or similar
        const url = `https://www.insurancedekho.com/car-insurance/rto-registration-details/${regNo}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        // Search for labels
        $('*').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('Registration Date')) data.registration_date = $(el).next().text().trim();
            if (text.includes('Fuel Type')) data.fuel_type = $(el).next().text().trim();
            if (text.includes('Full Name')) data.owner_name = $(el).next().text().trim();
        });

        return data;
    } catch (e) {
        return { error: 'InsuranceDekho failed: ' + e.message };
    }
}

testInsuranceDekho('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
