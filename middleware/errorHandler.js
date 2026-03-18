/**
 * Middleware de gestion centralisée des erreurs
 */

// Classes d'erreurs personnalisées
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Erreur serveur interne';

  // Erreur de validation (mauvais format JSON)
  if (err instanceof SyntaxError && err.status === 400) {
    const message = 'Format JSON invalide';
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: message
    });
  }

  // Erreur de connexion à la BD (PostgreSQL)
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message: 'Service indisponible. Impossible de se connecter à la base de données.'
    });
  }

  // Erreur de violation unique (doublon)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: 'Cette ressource existe déjà.'
    });
  }

  // Erreur de clé étrangère
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Référence invalide. La ressource liée n\'existe pas.'
    });
  }

  // Erreur non trouvée (404)
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: err.message
    });
  }

  // Erreur opérationnelle attendue
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message
    });
  }

  // Erreur non prévue (génération de log pour le serveur)
  console.error('❌ Erreur non gérée:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack
  });

  // Ne pas exposer les détails des erreurs en production
  return res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erreur serveur interne'
      : err.message
  });
};

// Middleware pour capturer les routes non trouvées
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route non trouvée: ${req.originalUrl}`, 404);
  next(error);
};

// Wrapper pour capturer les erreurs asynchrones dans les routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};
