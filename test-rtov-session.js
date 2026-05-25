const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeRtoVehicle(regNo) {
    try {
        console.log(`Step 1: Fetching initial page for ${regNo}...`);
        const res1 = await axios.get(`https://www.rtovehicle.info/vehicle/details?reg_no=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const cookies = res1.headers['set-cookie'];
        const $1 = cheerio.load(res1.data);
        const refreshMeta = $1('meta[http-equiv="refresh"]').attr('content');

        if (refreshMeta) {
            const redirectUrl = refreshMeta.split('URL=')[1];
            console.log(`Step 2: Following redirect: ${redirectUrl}`);

            const res2 = await axios.get(redirectUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Cookie': cookies ? cookies.join('; ') : '',
                    'Referer': `https://www.rtovehicle.info/vehicle/details?reg_no=${regNo}`
                }
            });

            console.log('Final Page Content Length:', res2.data.length);
            const $2 = cheerio.load(res2.data);
            const data = {};

            $2('table tr').each((i, el) => {
                const label = $2(el).find('td').first().text().trim();
                const val = $2(el).find('td').last().text().trim();
                if (label && val) data[label] = val;
            });

            return data;
        } else {
            console.log('No redirect found. Checking for anti-bot messages...');
            if (res1.data.includes('cheq')) console.log('Found Cheq anti-bot script');
            return null;
        }
    } catch (e) {
        console.log('Error:', e.message);
        return null;
    }
}

scrapeRtoVehicle('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
