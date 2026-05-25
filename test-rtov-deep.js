const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeRtoVehicleDeep(regNo) {
    try {
        console.log(`Testing rtovehicle-info DEEP for ${regNo}...`);

        // Phase 1: Get the redirect URL
        const res1 = await axios.get(`https://www.rtovehicle.info/vehicle/details?reg_no=${regNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $1 = cheerio.load(res1.data);
        const meta = $1('meta[http-equiv="refresh"]').attr('content');
        if (!meta) return { error: 'No redirect meta found' };

        const redirectUrl = meta.split('URL=')[1];
        if (!redirectUrl) return { error: 'No URL in meta' };

        console.log(`Following redirect to: ${redirectUrl}...`);

        // Phase 2: Follow the redirect
        const res2 = await axios.get(redirectUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `https://www.rtovehicle.info/vehicle/details?reg_no=${regNo}`
            },
            timeout: 10000
        });

        const $2 = cheerio.load(res2.data);
        const data = {};

        $2('tr').each((i, el) => {
            const label = $2(el).find('td').first().text().trim();
            const val = $2(el).find('td').last().text().trim();
            if (label && val) {
                data[label] = val;
            }
        });

        // Search in text if table search fails
        if (Object.keys(data).length < 2) {
            $2('div, p, span').each((i, el) => {
                const text = $2(el).text().trim();
                if (text.includes('Owner Name')) data.owner_name = $2(el).next().text().trim();
                if (text.includes('Registration Date')) data.reg_date = $2(el).next().text().trim();
                // Add more as needed
            });
        }

        return data;
    } catch (e) {
        return { error: 'RTOVehicleDeep failed: ' + e.message };
    }
}

scrapeRtoVehicleDeep('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
