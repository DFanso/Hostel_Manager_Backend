const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');

router.post('/login', parentController.parentLogin);
router.get('/attendance', parentController.viewAttendance);

module.exports = router;
