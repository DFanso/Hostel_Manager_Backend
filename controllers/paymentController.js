const Payment = require('../models/paymentModel');
const Student = require('../models/studentModel');
const Parent = require('../models/parentModel');
const jwt = require('jsonwebtoken');

exports.createPayment = async (req, res) => {
  try {
    const { payerType, amount, month } = req.body;
    const year = new Date().getFullYear(); // Get the current year from the system

    // Extract JWT token and decode it
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    let studentId;

    if (payerType === 'parent') {
      
      const parent = await Parent.findById(userId);

      if (!parent) {
        return res.status(404).json({ message: 'Parent not found' });
      }
      studentId = parent.studentId;
      
    } else if (payerType === 'student') {
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      studentId = student.studentId;
    } else {
      return res.status(400).json({ message: 'Invalid payer type' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const existingPayment = await Payment.findOne({ studentId, month, year });
    if (existingPayment) {
      existingPayment.amount += amount;
      await existingPayment.save();
      return res.status(200).json({
        message: "Payment updated successfully",
        payment: existingPayment,
      });
    }
    
    const payment = new Payment({ studentId, payerType, amount, month, year });
    await payment.save();
    res.status(201).json({ message: "Payment created successfully", payment });
  } catch (error) {
    res.status(400).json({ message: "Payment creation failed", error });
  }
};

exports.getPaymentHistoryByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const payments = await Payment.find({ studentId });
      res
        .status(200)
        .json({ message: "Payment history retrieved successfully", payments });
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Payment history retrieval failed", error });
  }
};
