const axios = require('axios');

async function testParkPlus(regNo) {
    try {
        console.log(`Testing Park+ for ${regNo}...`);
        // Park+ often uses car/vahan-details
        const res = await axios.get(`https://parkplus.io/api/v1/vahan/details?registrationNumber=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'Park+ failed: ' + e.message };
    }
}

testParkPlus('HR55AP0244').then(d => console.log('Park+ Result:', JSON.stringify(d, null, 2)));
