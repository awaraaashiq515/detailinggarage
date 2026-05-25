const axios = require('axios');
const cheerio = require('cheerio');

async function testChallanInfo(regNo) {
    try {
        console.log(`Testing CarInfo Challan for ${regNo}...`);
        const url = `https://www.carinfo.app/challan-details/${regNo}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        console.log('Title:', $('title').text());

        // Sometimes JSON is in script tags here too
        const nextData = $('#__NEXT_DATA__').html();
        if (nextData) {
            const json = JSON.parse(nextData);
            // Search for dates in the JSON
            const str = JSON.stringify(json);
            const dateMatch = str.match(/\d{1,2}-[A-Za-z]+-\d{4}/g);
            if (dateMatch) console.log('Found Dates in JSON:', dateMatch);
        }

        return data;
    } catch (e) {
        return { error: 'ChallanInfo failed: ' + e.message };
    }
}

testChallanInfo('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
