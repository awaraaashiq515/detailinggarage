const axios = require('axios');
const fs = require('fs');

async function downloadJs() {
    try {
        const url = 'https://www.carinfo.app/_next/static/chunks/pages/rc-details/%5Brc%5D-40129fe97e19451c.js';
        console.log('Downloading:', url);
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        fs.writeFileSync('carinfo-logic.js', res.data);
        console.log('Saved to carinfo-logic.js');
    } catch (e) {
        console.log('Error:', e.message);
    }
}

downloadJs();
