require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const session = require('express-session');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET || 'campus-eco-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static('public'));

const signalementRoutes = require('./routes/signalementRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/', signalementRoutes);
app.use('/admin', adminRoutes);

// Middleware pour les routes non trouvées
app.use(notFoundHandler);

// Gestionnaire d'erreurs centralisé
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n Campus Éco-Responsable lancé sur http://localhost:${PORT}\n`);
});
