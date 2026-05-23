const QRCode = require('qrcode');
const puzzles = require('./puzzles.json');

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Uso: node generate-qr.js <base-url>');
  console.error('Es:  node generate-qr.js https://mia-app.railway.app');
  process.exit(1);
}

const opts = { width: 500, margin: 2, color: { dark: '#0e0b07', light: '#f0ddb0' } };

puzzles.forEach(({ id }) => {
  const url = `${baseUrl.replace(/\/$/, '')}/${id}`;
  const file = `qr-code-${id}.png`;
  QRCode.toFile(file, url, opts, (err) => {
    if (err) throw err;
    console.log(`QR salvato: ${file}  →  ${url}`);
  });
});
