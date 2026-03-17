const express = require('express');
const router = express.Router();
const controller = require('../controllers/signalementController');

router.post('/signalement', controller.create);
router.get('/signalements', controller.getAll);
router.get('/stats', controller.stats);
router.put('/signalement/:id', controller.update);

module.exports = router;
