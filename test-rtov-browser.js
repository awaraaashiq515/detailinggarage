const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeRtoVehicleBrowser(regNo) {
    try {
        console.log(`Simulating Browser for ${regNo}...`);

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
        };

        const res1 = await axios.get(`https://www.rtovehicle.info/vehicle/details?reg_no=${regNo}`, {
            headers,
            timeout: 10000
        });

        console.log('Page 1 Status:', res1.status);
        const $1 = cheerio.load(res1.data);

        // Search for the meta refresh URL
        const meta = $1('meta[http-equiv="refresh"]').attr('content');
        if (meta) {
            const redirectUrl = meta.split('URL=')[1];
            console.log('Found redirect:', redirectUrl);

            const res2 = await axios.get(redirectUrl, {
                headers: {
                    ...headers,
                    'Referer': `https://www.rtovehicle.info/vehicle/details?reg_no=${regNo}`,
                    'Cookie': res1.headers['set-cookie'] ? res1.headers['set-cookie'].join('; ') : ''
                },
                timeout: 10000
            });

            console.log('Page 2 Status:', res2.status);
            const $2 = cheerio.load(res2.data);
            const data = {};

            $2('table tr').each((i, el) => {
                const label = $2(el).find('td').first().text().trim();
                const val = $2(el).find('td').last().text().trim();
                if (label && val) data[label] = val;
            });

            return data;
        } else {
            console.log('HTML Snippet:', res1.data.substring(0, 500));
            return { error: 'No redirect' };
        }
    } catch (e) {
        return { error: e.message };
    }
}

scrapeRtoVehicleBrowser('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
