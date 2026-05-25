const axios = require('axios');
const fs = require('fs');

async function downloadChunk() {
    try {
        const url = 'https://www.carinfo.app/_next/static/chunks/2273.8ddc92dcb8e468f1.js';
        console.log('Downloading:', url);
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        fs.writeFileSync('chunk-2273.js', res.data);
        console.log('Saved to chunk-2273.js');
    } catch (e) {
        console.log('Error:', e.message);
    }
}

downloadChunk();
