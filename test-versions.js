const axios = require('axios');

async function testVersions(regNo) {
    const urls = [
        `https://www.cardekho.com/api/v1/rc/details?rc_number=${regNo}`,
        `https://www.cardekho.com/api/v2/rc/details?rc_number=${regNo}`,
        `https://www.cardekho.com/api/v1/vahan/details?registrationNumber=${regNo}`
    ];

    for (const url of urls) {
        try {
            console.log(`Testing ${url}...`);
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 5000
            });
            console.log(`Success! data:`, JSON.stringify(res.data, null, 2));
            return;
        } catch (e) {
            console.log(`Failed: ${e.message}`);
        }
    }
}

testVersions('HR55AP0244');
