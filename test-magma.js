const axios = require('axios');

async function testMagma(regNo) {
    try {
        console.log(`Testing Magma HDI for ${regNo}...`);
        const url = `https://www.magma-hdi.com/itigicustomer-portlet/api/vahan/search?regNo=${regNo}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.magma-hdi.com/'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'Magma failed: ' + e.message, status: e.response?.status };
    }
}

testMagma('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
