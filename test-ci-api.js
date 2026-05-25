const axios = require('axios');

async function testCarInfoApi(regNo) {
    try {
        console.log(`Testing CarInfo API for ${regNo}...`);
        const res = await axios.get(`https://www.carinfo.app/api/v1/rc-details/${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `https://www.carinfo.app/rc-details/${regNo}`
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'CarInfo API failed: ' + e.message };
    }
}

testCarInfoApi('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
