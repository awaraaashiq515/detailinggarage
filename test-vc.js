const axios = require('axios');
const cheerio = require('cheerio');

async function testVehicleCheck(regNo) {
    try {
        console.log(`Testing VehicleCheck for ${regNo}...`);
        const url = `https://vehiclecheck.in/vehicle-details/${regNo.toLowerCase()}`;
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

        if (Object.keys(data).length === 0) {
            console.log('No table found. Checking text...');
            $('*').each((i, el) => {
                const t = $(el).text().trim();
                if (t === 'Registration Date') data.reg_date = $(el).next().text().trim();
            });
        }

        return data;
    } catch (e) {
        return { error: 'VehicleCheck failed: ' + e.message, status: e.response?.status };
    }
}

testVehicleCheck('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
