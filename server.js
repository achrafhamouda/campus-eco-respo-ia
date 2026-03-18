require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const signalementRoutes = require('./routes/signalementRoutes');
app.use('/', signalementRoutes);

// Middleware pour les routes non trouvées
app.use(notFoundHandler);

// Gestionnaire d'erreurs centralisé
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🌿 Campus Éco-Responsable lancé sur http://localhost:${PORT}\n`);
});
