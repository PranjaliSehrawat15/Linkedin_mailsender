const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');

router.get('/', recruiterController.getRecruiters);
router.get('/:id', recruiterController.getRecruiter);
router.delete('/:id', recruiterController.deleteRecruiter);
router.patch('/:id/status', recruiterController.updateRecruiterStatus);

module.exports = router;
