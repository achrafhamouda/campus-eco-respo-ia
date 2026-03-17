require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const signalementRoutes = require('./routes/signalementRoutes');
app.use('/', signalementRoutes);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err.message);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🌿 Campus Éco-Responsable lancé sur http://localhost:${PORT}\n`);
});
