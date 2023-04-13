const mongoose = require("mongoose");
const Attendance = require("../models/attendanceModel");
const Parent = require("../models/parentModel");
const Student = require("../models/studentModel");

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
  console.log("Request body:", req.body);
  const authHeader = req.headers["authorization"];
  const qrToken = req.body.qrToken;
  const secretKey = process.env.JWT_SECRET;

  if (!authHeader) {
    console.log("Error: No token provided");
    return res.status(401).json({ message: "No token provided" });
  }
  if (!qrToken) {
    console.log("Error: No QR token provided");
    return res.status(400).json({ message: "No QR token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, async (err, decodedToken) => {
    console.log("Decoded token:", decodedToken);
    if (err) {
      console.log("Error: Invalid or expired token");
      console.log(err);
      return res
        .status(401)
        .json({ message: "Invalid or expired token", err: err });
    } else {
      try {
        // Check if header token is valid
        const decodedQR = jwt.verify(qrToken, secretKey);
        // Check if token is expired
        const now = new Date();
        if (now > new Date(decodedQR.expiresIn)) {
          console.log("Error: QRToken has expired");
          return res.status(401).json({ message: "QRToken has expired" });
        }
        const userId = decodedToken._id; // Extract the user ID from the decoded JWT
        const action = req.body.buttonName;
        const timestamp = req.body.timeStamp;

        console.log("User ID:", userId);
        console.log("Action:", action);
        console.log("Timestamp:", timestamp);

        // Modify markAttendance to include timestamp
        const newAttendance = new Attendance({
          userId,
          action,
          timestamp, // Include the timestamp when creating a new Attendance instance
        });

        await newAttendance.save();
        console.log("Attendance saved successfully");

        res.status(200).json({ message: "Attendance taken successfully" });
      } catch (err) {
        console.log("Error: Invalid QR token");
        console.log(err);
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

exports.getAttendanceByParentID = async (req, res) => {
  console.log("Hit getAttendanceByParentID");
  try {
    const { parentId } = req.params;
    const dataCount = parseInt(req.query.dataCount);
    const token = req.headers.authorization.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      } else {
        // Retrieve parent by ID
        const parent = await Parent.findById(parentId);

        if (!parent) {
          return res.status(404).json({ message: "Parent not found" });
        }

        // Retrieve the student ID from the parent model
        const studentId = parent.studentId;

        const student = await Student.findOne({ studentId: studentId });

        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        const stId = student._id;

        // Calculate skip count for pagination
        const skipCount = (dataCount - 1) * 10;

        // Retrieve attendance records for the specified student
        const attendanceRecords = await Attendance.find({ userId: stId })
          .sort({ timestamp: -1 }) // Sort by descending timestamp to get the latest records first
          .skip(skipCount)
          .limit(10);

        const totalRecords = await Attendance.countDocuments({
          userId: stId,
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
          studentId,
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
