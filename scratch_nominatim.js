const https = require('https');

function fetchNominatim(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'bar-menu-test-app' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const url1 = `https://nominatim.openstreetmap.org/search?format=json&street=${encodeURIComponent('Praça da Sé, 1')}&city=${encodeURIComponent('São Paulo')}&state=SP&country=Brasil&limit=1`;
  const nomRes1 = await fetchNominatim(url1);
  console.log('Structured (Praça da Sé, 1):', nomRes1.length);
}

run();
