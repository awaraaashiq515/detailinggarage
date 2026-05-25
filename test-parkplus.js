const axios = require('axios');
const cheerio = require('cheerio');

async function testParkPlus(regNo) {
    try {
        console.log(`Testing ParkPlus for ${regNo}...`);
        const url = `https://parkplus.io/rto-vehicle-information/${regNo.toUpperCase()}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        console.log('Title:', $('title').text());

        // ParkPlus often has data in a table or colored rows
        $('div').each((i, el) => {
            const text = $(el).text().trim();
            if (text === 'Registration Date') data.reg_date = $(el).next().text().trim();
            if (text === 'Fuel Type') data.fuel_type = $(el).next().text().trim();
        });

        if (Object.keys(data).length === 0) {
            console.log('No direct matches. Searching all text for "Registration Date"...');
            $('*').each((i, el) => {
                const t = $(el).text().trim();
                if (t === 'Registration Date') {
                    data.reg_date = $(el).next().text().trim();
                    if (!data.reg_date) data.reg_date = $(el).parent().next().text().trim();
                }
            });
        }

        return data;
    } catch (e) {
        return { error: 'ParkPlus failed: ' + e.message, status: e.response?.status };
    }
}

testParkPlus('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
