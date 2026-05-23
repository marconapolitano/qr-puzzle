const QRCode = require('qrcode');

const url = process.argv[2];
if (!url) {
  console.error('Uso: node generate-qr.js <url>');
  console.error('Es:  node generate-qr.js https://mia-app.railway.app');
  process.exit(1);
}

QRCode.toFile('qr-code.png', url, {
  width: 500,
  margin: 2,
  color: { dark: '#0e0b07', light: '#f0ddb0' }
}, (err) => {
  if (err) throw err;
  console.log('QR code salvato in qr-code.png');
});
