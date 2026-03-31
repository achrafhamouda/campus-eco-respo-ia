-- Script d'initialisation — Campus Éco-Responsable & IA
-- ENSA Béni Mellal
-- Exécuter : psql -U postgres -c "CREATE DATABASE campus_eco;" puis
--            psql -U postgres -d campus_eco -f schema.sql

CREATE TABLE IF NOT EXISTS signalements (
  id             SERIAL PRIMARY KEY,
  description    TEXT        NOT NULL,
  suggestion     TEXT,
  statut         VARCHAR(20) NOT NULL DEFAULT 'nouveau',
  anonyme        BOOLEAN     NOT NULL DEFAULT FALSE,
  date_creation  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signalements_date ON signalements (date_creation DESC);
