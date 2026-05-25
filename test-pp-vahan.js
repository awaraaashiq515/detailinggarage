const axios = require('axios');
const cheerio = require('cheerio');

async function testParkPlusVahan(regNo) {
    try {
        console.log(`Testing ParkPlus Vahan for ${regNo}...`);
        const url = `https://parkplus.io/vahan/${regNo.toLowerCase()}/`;
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

        // ParkPlus /vahan/ page often has a specific data structure
        // Let's search for labels
        $('*').each((i, el) => {
            const t = $(el).text().trim();
            if (t === 'Registration Date') {
                data.reg_date = $(el).next().text().trim();
            }
            if (t === 'Fuel Type') {
                data.fuel_type = $(el).next().text().trim();
            }
        });

        return data;
    } catch (e) {
        return { error: 'ParkPlus Vahan failed: ' + e.message, status: e.response?.status };
    }
}

testParkPlusVahan('HP78B7878').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
