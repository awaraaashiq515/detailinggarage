const axios = require('axios');

async function testIffco(regNo) {
    try {
        console.log(`Testing Iffco Tokio for ${regNo}...`);
        // Note: This is a common pattern for Iffco Tokio's backend
        const res = await axios.get(`https://www.iffcotokio.co.in/itigicustomer-portlet/api/vahan/search?regNo=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.iffcotokio.co.in/'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'Iffco failed: ' + e.message, status: e.response?.status };
    }
}

testIffco('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
