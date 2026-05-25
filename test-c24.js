const axios = require('axios');
const cheerio = require('cheerio');

async function testCars24(regNo) {
    try {
        console.log(`Testing Cars24 for ${regNo}...`);
        const url = `https://www.cars24.com/rto-vehicle-registration-details/${regNo.toLowerCase()}/`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        console.log('Title:', $('title').text());

        // Search for all label-value pairs in divs/spans
        $('div, p, span, td').each((i, el) => {
            const text = $(el).text().trim();
            if (text === 'Registration Date') data.reg_date = $(el).next().text().trim();
            if (text === 'Fuel Type') data.fuel_type = $(el).next().text().trim();
            if (text === 'Owner Name') data.owner = $(el).next().text().trim();
        });

        // Try table rows
        $('tr').each((i, el) => {
            const label = $(el).find('td').first().text().trim();
            const val = $(el).find('td').last().text().trim();
            if (label && val) data[label] = val;
        });

        return data;
    } catch (e) {
        return { error: 'Cars24 failed: ' + e.message };
    }
}

testCars24('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
