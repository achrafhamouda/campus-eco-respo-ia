const pool = require('../db');

const creerSignalement = async (description, type, suggestion, anonyme, type_personnalise) => {
  return pool.query(
    `INSERT INTO signalements(description, type, suggestion, anonyme, type_personnalise)
     VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [description, type, suggestion, anonyme || false, type_personnalise || null]
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

const supprimerSignalement = async (id) => {
  return pool.query(
    `DELETE FROM signalements WHERE id=$1 RETURNING *`,
    [id]
  );
};

module.exports = { creerSignalement, getSignalements, updateStatut, getStatsRows, supprimerSignalement };
