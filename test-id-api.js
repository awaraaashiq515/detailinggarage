const axios = require('axios');

async function testIdApi(regNo) {
    try {
        console.log(`Testing InsuranceDekho API for ${regNo}...`);
        const res = await axios.get(`https://www.insurancedekho.com/api/v1/rto/vehicle-details?registrationNumber=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.insurancedekho.com/'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'ID API failed: ' + e.message, status: e.response?.status };
    }
}

testIdApi('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
