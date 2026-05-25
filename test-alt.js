const axios = require('axios');

async function testCarDekho(regNo) {
    try {
        console.log(`Testing CarDekho for ${regNo}...`);
        const res = await axios.get(`https://www.cardekho.com/api/v1/rc/details?rc_number=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'CarDekho failed: ' + e.message };
    }
}

async function testSpinny(regNo) {
    try {
        console.log(`Testing Spinny for ${regNo}...`);
        const res = await axios.get(`https://www.spinny.com/api/get-vahan-details/?registration_number=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        return res.data;
    } catch (e) {
        return { error: 'Spinny failed: ' + e.message };
    }
}

async function run() {
    const regNo = 'HR55AP0244';
    const cardekho = await testCarDekho(regNo);
    const spinny = await testSpinny(regNo);
    console.log('Results:', JSON.stringify({ cardekho, spinny }, null, 2));
}

run();
