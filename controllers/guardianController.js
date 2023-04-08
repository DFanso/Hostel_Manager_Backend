const bcrypt = require("bcryptjs");
const Guardian = require("../models/guardianModel");
const { JWT_SECRET } = require('../config/env');

exports.registerGuardian = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const guardianExists = await Guardian.findOne({ email });
    if (guardianExists) {
      return res.status(400).json({ message: "Guardian with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newGuardian = new Guardian({
      username,
      email,
      password: hashedPassword,
    });

    const savedGuardian = await newGuardian.save();
    res.status(201).json({ message: "Guardian registered successfully", guardian: savedGuardian });
  } catch (err) {
    res.status(500).json({ message: "An error occurred while registering the guardian", error: err });
  }
};


exports.loginGuardian = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const guardian = await Guardian.findOne({ email });
      if (!guardian) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, guardian.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      res.status(200).json({ message: "Guardian logged in successfully" });
    } catch (err) {
      res.status(500).json({ message: "An error occurred while logging in the guardian", error: err });
    }
  };