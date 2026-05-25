const axios = require('axios');

async function testNextData(regNo) {
    try {
        const buildId = 'Ots9rYhDIcQhdD26VKG-4';
        const url = `https://www.carinfo.app/_next/data/${buildId}/rc-details/${regNo}.json`;
        console.log('Fetching:', url);

        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Next.js data requests often need this
                'x-nextjs-data': '1'
            },
            timeout: 10000
        });

        console.log('Success! Keys:', Object.keys(res.data));
        if (res.data.pageProps) {
            console.log('Page Props Keys:', Object.keys(res.data.pageProps));
            // Check if xdataprops is here and decrypt it
        }

    } catch (e) {
        console.log('Error:', e.message, e.response?.status);
    }
}

testNextData('HR55AP0244');
