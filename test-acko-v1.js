const axios = require('axios');

async function testAckoV1(regNo) {
    try {
        console.log(`Testing Acko V1 for ${regNo}...`);
        const res = await axios.get(`https://www.acko.com/api/v1/vahan/vehicle-details?registration_number=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.acko.com/'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'AckoV1 failed: ' + e.message, status: e.response?.status };
    }
}

testAckoV1('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
