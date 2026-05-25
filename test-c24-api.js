const axios = require('axios');

async function testCars24Api(regNo) {
    try {
        console.log(`Testing Cars24 API for ${regNo}...`);
        const res = await axios.get(`https://www.cars24.com/api/v1/rto/vehicle-details/?registration_number=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.cars24.com/'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'Cars24Api failed: ' + e.message, status: e.response?.status };
    }
}

testCars24Api('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
