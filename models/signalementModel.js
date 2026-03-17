const pool = require('../db');

const creerSignalement = async (description, type, suggestion, anonyme) => {
  return pool.query(
    `INSERT INTO signalements(description, type, suggestion, anonyme)
     VALUES($1, $2, $3, $4) RETURNING *`,
    [description, type, suggestion, anonyme || false]
  );
};

const getSignalements = async (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  return pool.query(
    `SELECT * FROM signalements ORDER BY id DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
};

const updateStatut = async (id, statut) => {
  return pool.query(
    `UPDATE signalements SET statut=$1 WHERE id=$2 RETURNING *`,
    [statut, id]
  );
};

const getStatsRows = async () => {
  const result = await pool.query(
    `SELECT statut, type, description FROM signalements`
  );
  return result.rows;
};

module.exports = { creerSignalement, getSignalements, updateStatut, getStatsRows };
