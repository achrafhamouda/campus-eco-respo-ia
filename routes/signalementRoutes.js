const express = require('express');
const router = express.Router();
const controller = require('../controllers/signalementController');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/signalement', asyncHandler(controller.create));
router.get('/signalements', asyncHandler(controller.getAll));
router.get('/stats', asyncHandler(controller.stats));
router.put('/signalement/:id', asyncHandler(controller.update));
router.delete('/signalement/:id', asyncHandler(controller.delete));

module.exports = router;
