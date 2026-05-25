const axios = require('axios');

async function testGoDigit(regNo) {
    try {
        console.log(`Testing GoDigit for ${regNo}...`);
        // Note: This endpoint is often used in their frontend
        const res = await axios.get(`https://www.godigit.com/motor-insurance/api/v1/vahan/vehicleinfo?registrationNumber=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.godigit.com/'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'GoDigit failed: ' + e.message };
    }
}

testGoDigit('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
