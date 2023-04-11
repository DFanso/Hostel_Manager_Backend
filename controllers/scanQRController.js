const mongoose = require("mongoose");
const Attendance = require("../models/attendanceModel.js");

const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const markAttendance = async (userId, action, timestamp) => {
  const newAttendance = new Attendance({
    userId,
    action,
  });

  await newAttendance.save();
};

exports.scanQR = async (req, res) => {
  const token = req.headers["token"];
  const qrToken = req.body.qrToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  if (!qrToken) {
    return res.status(400).json({ message: "No QR token provided" });
  }
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    } else {
      try {
        // Check if header token is valid
        const decoded = jwt.verify(qrToken, secretKey);
        // Check if token is expired
        const now = new Date();
        if (now > new Date(decoded.expiresIn)) {
          return res.status(401).json({ message: "QRToken has expired" });
        }
        const userId = req.body.userId;
        const action = req.body.action;
        const timestamp = req.body.timestamp;

        await markAttendance(userId, action, timestamp);
        // Run studentAttendance function
        res.json({ message: "Attendance taken successfully" });
      } catch (err) {
        return res.status(401).json({ message: "Invalid QR token" });
      }
    }
  });
};
