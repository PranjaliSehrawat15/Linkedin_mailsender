const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/', historyController.getHistory);
router.get('/emails', historyController.getEmailHistory);
router.get('/analytics', historyController.getAnalytics);

module.exports = router;
