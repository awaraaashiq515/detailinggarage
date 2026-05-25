const axios = require('axios');

async function testCarInfoApi(regNo) {
    try {
        console.log(`Testing CarInfo WWW API for ${regNo}...`);
        const url = `https://www.carinfo.app/api/v1/rc-details/${regNo}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        return res.data;
    } catch (e) {
        return { error: 'CarInfo WWW API failed: ' + e.message, status: e.response?.status };
    }
}

testCarInfoApi('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
