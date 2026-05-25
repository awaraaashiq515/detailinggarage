const fs = require('fs');

const data = JSON.parse(fs.readFileSync('decrypted-full.json', 'utf8'));

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (let key in obj) {
        keys.push(prefix + key);
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getAllKeys(obj[key], prefix + key + '.'));
        }
    }
    return keys;
}

const allKeys = getAllKeys(data);
console.log('All Keys found in decrypted data:');
allKeys.forEach(k => console.log(k));
