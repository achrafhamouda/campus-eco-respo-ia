-- Crée la table si elle n'existe pas du tout
CREATE TABLE IF NOT EXISTS signalements (
  id            SERIAL PRIMARY KEY,
  description   TEXT         NOT NULL,
  suggestion    TEXT,
  statut        VARCHAR(20)  NOT NULL DEFAULT 'nouveau',
  anonyme       BOOLEAN      NOT NULL DEFAULT FALSE,
  date_creation TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Ajoute les colonnes manquantes (sans toucher aux données existantes)
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS suggestion    TEXT;
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS statut        VARCHAR(20)  NOT NULL DEFAULT 'nouveau';
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS anonyme       BOOLEAN      NOT NULL DEFAULT FALSE;
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP    NOT NULL DEFAULT NOW();

-- Met à jour les lignes qui ont statut NULL
UPDATE signalements SET statut = 'nouveau' WHERE statut IS NULL;

SELECT 'Table OK ✅' AS resultat;
\d signalements
