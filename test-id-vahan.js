const axios = require('axios');
const cheerio = require('cheerio');

async function testInsuranceDekhoVahan(regNo) {
    try {
        console.log(`Testing InsuranceDekho Vahan for ${regNo}...`);
        const url = `https://www.insurancedekho.com/car-insurance/vahan-registration-details/${regNo.toLowerCase()}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const data = {};

        $('.vahan-details-card_vahanDetailsCardRow__2S0h0').each((i, el) => {
            const label = $(el).find('span').first().text().trim();
            const val = $(el).find('span').last().text().trim();
            if (label && val) data[label] = val;
        });

        if (Object.keys(data).length === 0) {
            $('div, td, span, p').each((i, el) => {
                const text = $(el).text().trim();
                if (text === 'Registration Date') data.reg_date = $(el).next().text().trim();
                if (text === 'Fuel Type') data.fuel_type = $(el).next().text().trim();
            });
        }

        return data;
    } catch (e) {
        return { error: 'InsuranceDekhoVahan failed: ' + e.message };
    }
}

testInsuranceDekhoVahan('HR55AP0244').then(d => console.log('Result:', JSON.stringify(d, null, 2)));
