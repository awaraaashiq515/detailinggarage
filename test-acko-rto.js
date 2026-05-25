const axios = require('axios');
const cheerio = require('cheerio');

async function testAckoRto(regNo) {
    try {
        console.log(`Testing Acko RTO for ${regNo}...`);
        const url = `https://www.acko.com/rto-vehicle-information/owner-details/${regNo.toLowerCase()}/`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        // Acko often uses tables or specific sections
        console.log('Title:', $('title').text());

        $('p, div, span').each((i, el) => {
            const text = $(el).text().trim();
            if (text === 'Owner Name') data.owner_name = $(el).next().text().trim();
            if (text === 'Registration Date') data.registration_date = $(el).next().text().trim();
            if (text === 'Fuel Type') data.fuel_type = $(el).next().text().trim();
            if (text === 'Engine Number') data.engine_number = $(el).next().text().trim();
            if (text === 'Chassis Number') data.chassis_number = $(el).next().text().trim();
            if (text === 'Model') data.model = $(el).next().text().trim();
        });

        return data;
    } catch (e) {
        return { error: 'AckoRto failed: ' + e.message };
    }
}

testAckoRto('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
