const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');

router.post('/', upload.single('resume'), uploadController.uploadResume);
router.get('/', uploadController.getResumes);
router.delete('/:id', uploadController.deleteResume);
router.get('/:id/download', uploadController.downloadResume);

module.exports = router;
