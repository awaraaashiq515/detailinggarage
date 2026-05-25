const axios = require('axios');
const fs = require('fs');

async function dumpFullHtml(regNo) {
    try {
        const res = await axios.get(`https://www.carinfo.app/rc-details/${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });
        fs.writeFileSync('full-page.html', res.data);
        console.log('HTML dumped to full-page.html');
    } catch (e) {
        console.log('Error:', e.message);
    }
}

dumpFullHtml('HR55AP0244');
