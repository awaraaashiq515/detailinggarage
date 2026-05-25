const cheerio = require('cheerio');
const fs = require('fs');

function extractFuelFromModel(model) {
    if (!model) return null;
    const m = model.toUpperCase();
    if (m.includes('PETROL')) return 'PETROL';
    if (m.includes('DIESEL')) return 'DIESEL';
    if (m.includes('CNG')) return 'CNG';
    if (m.includes('LPG')) return 'LPG';
    if (m.includes('ELECTRIC') || m.includes(' EV ')) return 'ELECTRIC';
    if (/\b(D)\b/.test(m)) return 'DIESEL';
    if (/\b(P)\b/.test(m)) return 'PETROL';
    return null;
}

function normalizeValue(key, value) {
    if (!value || value === '—' || value.length < 1) return '—';
    let clean = value.replace(/^(Rs\.|INR|Expires on|Expiring on)\s*/i, '').trim();
    if (key.includes('validity') || key.includes('date')) {
        const match = clean.match(/(\d{1,2}-[A-Z][a-z]{2}-\d{4})/);
        if (match) clean = match[1];
    }
    return clean.toUpperCase();
}

const html = fs.readFileSync('full-page.html', 'utf8');
const $ = cheerio.load(html);
const data = {};

const labelMap = {
    'Owner Name': 'owner_name',
    'Make & Model': 'model',
    'Maker Model': 'model',
    'Registration Date': 'registration_date',
    'Fuel Type': 'fuel_type',
    'Registered RTO': 'registration_authority'
};

$('p, div, span, td, li').each((_, el) => {
    const text = $(el).text().trim();
    if (labelMap[text]) {
        const key = labelMap[text];
        if (!data[key] || data[key] === '—') {
            let val = $(el).next().text().trim();
            if (!val) val = $(el).parent().find('p, span').last().text().trim();
            if (val && val !== text) data[key] = normalizeValue(key, val);
        }
    }
    if (text.includes('Insurance Expiring')) {
        const match = text.match(/(\d{1,2}-[A-Z][a-z]{2}-\d{4})/);
        if (match) data.insurance_validity = match[1].toUpperCase();
    }
});

if (!data.fuel_type && data.model) {
    data.fuel_type = extractFuelFromModel(data.model);
}

console.log('Verified Scraped Data:', JSON.stringify(data, null, 2));
