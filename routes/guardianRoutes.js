const express = require("express");
const router = express.Router();
const guardianController = require("../controllers/guardianController");

router.post("/register", guardianController.registerGuardian);
router.post("/login", guardianController.loginGuardian);

module.exports = router;
