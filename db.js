require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.DB_USER     || 'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  database: process.env.DB_NAME     || 'campus_eco',
  password: process.env.DB_PASSWORD || 'sofyan2004',
  port:     parseInt(process.env.DB_PORT || '5432'),
});

async function initialiserDB() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connecté à PostgreSQL');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS signalements (
        id            SERIAL      PRIMARY KEY,
        type          VARCHAR(20) NOT NULL DEFAULT 'autre',
        description   TEXT        NOT NULL,
        suggestion    TEXT,
        statut        VARCHAR(20) NOT NULL DEFAULT 'nouveau',
        anonyme       BOOLEAN     NOT NULL DEFAULT FALSE,
        date_creation TIMESTAMP   NOT NULL DEFAULT NOW()
      )
    `);

    // Migrations pour les tables existantes
    const migrations = [
      `ALTER TABLE signalements ADD COLUMN IF NOT EXISTS type          VARCHAR(20) NOT NULL DEFAULT 'autre'`,
      `ALTER TABLE signalements ADD COLUMN IF NOT EXISTS suggestion    TEXT`,
      `ALTER TABLE signalements ADD COLUMN IF NOT EXISTS statut        VARCHAR(20) NOT NULL DEFAULT 'nouveau'`,
      `ALTER TABLE signalements ADD COLUMN IF NOT EXISTS anonyme       BOOLEAN     NOT NULL DEFAULT FALSE`,
      `ALTER TABLE signalements ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP   NOT NULL DEFAULT NOW()`,
    ];
    for (const sql of migrations) {
      await pool.query(sql);
    }

    console.log('✅ Table "signalements" prête');
  } catch (err) {
    console.error('❌ Erreur base de données:', err.message);
    console.error('👉 Copiez .env.example en .env et remplissez les variables DB_*');
    process.exit(1);
  }
}

initialiserDB();
module.exports = pool;
