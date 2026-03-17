const { creerSignalement, getSignalements, updateStatut, getStatsRows } = require('../models/signalementModel');

const STATUTS_VALIDES = ['nouveau', 'en_cours', 'traité'];
const TYPES_VALIDES   = ['eau', 'lumiere', 'energie', 'dechets', 'autre'];

// ── Utilitaire : normalise un texte (minuscules + suppression des accents) ──
function normaliser(texte) {
  return (texte || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ── Détecte le type à partir de la description ──
function detecterType(description) {
  const d = normaliser(description);
  if (d.includes('eau') || d.includes('robinet') || d.includes('fuite'))                           return 'eau';
  if (d.includes('lumiere') || d.includes('eclairage') || d.includes('lampe') || d.includes('salle')) return 'lumiere';
  if (d.includes('energie') || d.includes('electricite') || d.includes('branche'))                 return 'energie';
  if (d.includes('dechet') || d.includes('poubelle') || d.includes('tri'))                         return 'dechets';
  return 'autre';
}

// ── Suggestions par type ──
const SUGGESTIONS = {
  eau:     "Vérifiez les robinets pour éviter le gaspillage. Signalez à la maintenance immédiatement.",
  lumiere: "Éteignez les lumières et équipements inutilisés. Privilégiez l'éclairage naturel.",
  energie: "Débranchez les appareils inutilisés pour économiser l'énergie.",
  dechets: "Triez les déchets dans les bonnes poubelles de recyclage. Réduire, réutiliser, recycler !",
  autre:   "Adoptez un comportement éco-responsable et signalez ce problème à l'administration.",
};

function genererSuggestion(type) {
  return SUGGESTIONS[type] || SUGGESTIONS.autre;
}

// ── POST /signalement ──
exports.create = async (req, res) => {
  const { description, anonyme, type: typeParam } = req.body;

  if (!description || description.trim().length < 3) {
    return res.status(400).json({ error: "La description est trop courte (min. 3 caractères)." });
  }
  if (description.trim().length > 2000) {
    return res.status(400).json({ error: "La description est trop longue (max. 2000 caractères)." });
  }

  const type       = TYPES_VALIDES.includes(typeParam) ? typeParam : detecterType(description);
  const suggestion = genererSuggestion(type);

  try {
    const result = await creerSignalement(description.trim(), type, suggestion, anonyme);
    console.log('[POST /signalement] Inséré id:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création signalement:', err.message);
    res.status(500).json({ error: "Erreur serveur lors de la création." });
  }
};

// ── GET /signalements ──
exports.getAll = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const result = await getSignalements(page, limit);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /signalements] ERREUR:', err.message);
    res.status(500).json({ error: "Erreur serveur lors de la récupération." });
  }
};

// ── GET /stats ──
exports.stats = async (req, res) => {
  try {
    const rows = await getStatsRows();
    const total      = rows.length;
    const par_statut = { nouveau: 0, en_cours: 0, traite: 0 };
    const par_type   = { eau: 0, lumiere: 0, energie: 0, dechets: 0, autre: 0 };

    rows.forEach(row => {
      if      (row.statut === 'nouveau')  par_statut.nouveau++;
      else if (row.statut === 'en_cours') par_statut.en_cours++;
      else if (row.statut === 'traité')   par_statut.traite++;

      const t = TYPES_VALIDES.includes(row.type) ? row.type : detecterType(row.description);
      par_type[t] = (par_type[t] || 0) + 1;
    });

    const taux_resolution = total > 0 ? Math.round((par_statut.traite / total) * 100) : 0;
    console.log(`[GET /stats] total=${total} taux=${taux_resolution}%`);
    res.json({ total, par_statut, par_type, taux_resolution });
  } catch (err) {
    console.error('[GET /stats] ERREUR:', err.message);
    res.status(500).json({ error: "Erreur serveur lors du calcul des statistiques." });
  }
};

// ── PUT /signalement/:id ──
exports.update = async (req, res) => {
  const { statut } = req.body;
  const id = parseInt(req.params.id);

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID invalide." });
  }
  if (!statut || !STATUTS_VALIDES.includes(statut)) {
    return res.status(400).json({
      error: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}`
    });
  }

  try {
    const result = await updateStatut(id, statut);
    if (!result.rows.length) {
      return res.status(404).json({ error: "Signalement introuvable." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur mise à jour statut:', err.message);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
};
