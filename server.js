const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const { secrets, puzzles } = require('./puzzles.json');
const puzzleMap = Object.fromEntries(puzzles.map(p => [p.id, p]));
const STATE_DIR = path.join(__dirname, 'state');

if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function statePath(id) {
  return path.join(STATE_DIR, `${id}.json`);
}

function getState(id) {
  const f = statePath(id);
  if (!fs.existsSync(f)) return { used: false, usedAt: null };
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function markUsed(id) {
  fs.writeFileSync(statePath(id), JSON.stringify({ used: true, usedAt: new Date().toISOString() }, null, 2));
}

app.get('/api/:id/status', (req, res) => {
  const puzzle = puzzleMap[req.params.id];
  if (!puzzle) return res.status(404).json({ error: 'not_found' });
  const state = getState(req.params.id);
  res.json({ used: state.used, message: puzzle.message });
});

app.post('/api/:id/redeem', (req, res) => {
  const puzzle = puzzleMap[req.params.id];
  if (!puzzle) return res.status(404).json({ error: 'not_found' });

  const state = getState(req.params.id);
  if (state.used) return res.json({ success: false, reason: 'already_used' });

  const input = (req.body.word || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!secrets.includes(input)) return res.json({ success: false, reason: 'wrong_word' });

  markUsed(req.params.id);
  res.json({ success: true });
});

// serve the single-page app for any puzzle route
app.get('/:id', (req, res) => {
  if (puzzleMap[req.params.id]) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
