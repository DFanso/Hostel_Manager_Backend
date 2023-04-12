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
  const secretKey = process.env.JWT_SECRET;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  if (!qrToken) {
    return res.status(400).json({ message: "No QR token provided" });
  }
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", err: err });
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

exports.getAttendanceStudentID = async (req, res) => {
  try {
    const { studentId } = req.params;
    const dataCount = parseInt(req.query.dataCount);
    const token = req.headers.authorization.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      } else {
        // Calculate skip count for pagination
        const skipCount = (dataCount - 1) * 10;

        // Retrieve attendance records for the specified student
        const attendanceRecords = await Attendance.find({ userId: studentId })
          .sort({ timestamp: -1 }) // Sort by descending timestamp to get the latest records first
          .skip(skipCount)
          .limit(10);

        const totalRecords = await Attendance.countDocuments({
          userId: studentId,
        });

        if (attendanceRecords.length === 0) {
          return res
            .status(404)
            .json({ message: "No attendance records found for this student" });
        }

        res.status(200).json({
          message: "Attendance records retrieved successfully",
          totalRecords,
          attendanceRecords,
        });
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Attendance retrieval failed", error });
  }
};

exports.getAllAttendanceOfStudents = async (req, res) => {
  try {
    const dataCount = parseInt(req.query.dataCount);
    const token = req.headers.authorization.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      } else {
        // Calculate skip count for pagination
        const skipCount = (dataCount - 1) * 10;

        // Retrieve all attendance records
        const attendanceRecords = await Attendance.find({})
          .sort({ timestamp: -1 }) // Sort by descending timestamp to get the latest records first
          .skip(skipCount)
          .limit(10);

        const totalRecords = await Attendance.countDocuments({});

        if (attendanceRecords.length === 0) {
          return res
            .status(404)
            .json({ message: "No attendance records found" });
        }

        res.status(200).json({
          message: "Attendance records retrieved successfully",
          totalRecords,
          attendanceRecords,
        });
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Attendance retrieval failed", error });
  }
};
