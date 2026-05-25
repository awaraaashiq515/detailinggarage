const axios = require('axios');

async function testInsuranceApi(regNo) {
    try {
        console.log(`Testing CarInfo Insurance API for ${regNo}...`);
        const url = `https://insurance.carinfo.app/quote-v1/vehicleDetails?vehicleNumber=${regNo}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'Insurance API failed: ' + e.message, status: e.response?.status };
    }
}

testInsuranceApi('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
