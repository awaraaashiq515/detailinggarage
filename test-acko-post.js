const axios = require('axios');

async function testAckoPost(regNo) {
    try {
        console.log(`Testing Acko POST for ${regNo}...`);
        const res = await axios.post(`https://www.acko.com/api/motor/v1/vahan/search/`, {
            registrationNumber: regNo
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/json',
                'Origin': 'https://www.acko.com',
                'Referer': 'https://www.acko.com/'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'AckoPost failed: ' + e.message, status: e.response?.status };
    }
}

testAckoPost('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
