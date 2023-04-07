const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/login', studentController.studentLogin);
router.post('/payFees', studentController.payFees);
router.post('/register', studentController.register); 

module.exports = router;
