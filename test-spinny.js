const axios = require('axios');
const cheerio = require('cheerio');

async function testSpinny(regNo) {
    try {
        console.log(`Testing Spinny for ${regNo}...`);
        const url = `https://www.spinny.com/vahan-details/${regNo.toLowerCase()}/`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        console.log('Title:', $('title').text());

        $('.vahan-details-card__row').each((i, el) => {
            const label = $(el).find('.vahan-details-card__label').text().trim();
            const val = $(el).find('.vahan-details-card__value').text().trim();
            if (label && val) data[label] = val;
        });

        if (Object.keys(data).length === 0) {
            console.log('No specific classes found. Checking all text...');
            $('div, p, span, td').each((i, el) => {
                const text = $(el).text().trim();
                if (text === 'Registration Date') data.reg_date = $(el).next().text().trim();
                if (text === 'Fuel Type') data.fuel_type = $(el).next().text().trim();
            });
        }

        return data;
    } catch (e) {
        return { error: 'Spinny failed: ' + e.message, status: e.response?.status };
    }
}

testSpinny('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
