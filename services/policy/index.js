const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Store policies keyed by name to prevent duplicates
const policiesByName = new Map();

app.get('/policies', (req, res) => {
  res.json({ policies: Array.from(policiesByName.values()) });
});

app.post('/policies', (req, res) => {
  const p = { id: Date.now(), ...req.body };
  // Upsert by name
  policiesByName.set(p.name, p);
  res.json({ createdOrUpdated: p });
});

// Optional: quick reset endpoint when demoing
app.delete('/policies', (req, res) => {
  policiesByName.clear();
  res.json({ ok: true });
});

// ... keep your existing imports, maps, etc.
app.post('/apply', async (req, res) => {
  const tags = await fetch('http://localhost:8001/classify', { method: 'POST' }).then(r => r.json());

  const appliedSet = new Set();
  const actions = [];

  for (const [file, fileTags] of Object.entries(tags)) {
    for (const p of policiesByName.values()) {
      const cond = p.rule?.ifTag;
      const shouldApply = !cond || fileTags.includes(cond);
      if (!shouldApply) continue;

      const key = `${file}|${p.rule?.action}|${p.name}`;
      if (appliedSet.has(key)) continue;
      appliedSet.add(key);

      // NEW: perform side-effect on disk via ingest
      if (p.rule?.action === 'quarantine' || p.rule?.action === 'delete') {
        await fetch(
          `http://localhost:8001/action?name=${encodeURIComponent(file)}&do=${p.rule.action}`,
          { method: 'POST' }
        );
      }

      actions.push({ file, action: p.rule?.action, policy: p.name });
    }
  }

  res.json({ applied: actions });
});


app.listen(8002, () => console.log('Policy service running on 8002'));
