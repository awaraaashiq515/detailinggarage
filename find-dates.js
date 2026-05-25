const fs = require('fs');
const html = fs.readFileSync('full-page.html', 'utf8');

// Pattern for DD-MMM-YYYY or similar
const datePattern = /(\d{1,2}-[A-Za-z]{3}-\d{4})/g;
const matches = html.match(datePattern);

console.log('--- DATE PATTERN MATCHES ---');
if (matches) {
    matches.forEach(m => {
        const index = html.indexOf(m);
        const surrounding = html.substring(index - 100, index + 100);
        console.log(`Match: ${m}`);
        console.log(`Context: ${surrounding}`);
        console.log('---');
    });
} else {
    console.log('No date patterns found.');
}
