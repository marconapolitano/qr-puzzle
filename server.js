const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const STATE_FILE = path.join(__dirname, 'state.json');
const SECRET_WORD = 'i porchettari';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getState() {
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ used: false, usedAt: null }, null, 2));
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function markUsed() {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ used: true, usedAt: new Date().toISOString() }, null, 2));
}

app.get('/api/status', (req, res) => {
  const state = getState();
  res.json({ used: state.used });
});

app.post('/api/redeem', (req, res) => {
  const state = getState();

  if (state.used) {
    return res.json({ success: false, reason: 'already_used' });
  }

  const input = (req.body.word || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (input !== SECRET_WORD) {
    return res.json({ success: false, reason: 'wrong_word' });
  }

  markUsed();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
