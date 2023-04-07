const Payment = require('../models/paymentModel');
const Student = require('../models/studentModel');

exports.createPayment = async (req, res) => {
  try {
    const { studentId, payerType, amount, month } = req.body;
    const year = new Date().getFullYear(); // Get the current year from the system
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const existingPayment = await Payment.findOne({ studentId, month, year });
    if (existingPayment) {
      existingPayment.amount += amount;
      await existingPayment.save();
      return res.status(200).json({ message: 'Payment updated successfully', payment: existingPayment });
    }
    const payment = new Payment({ studentId, payerType, amount, month, year });
    await payment.save();
    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (error) {
    res.status(400).json({ message: 'Payment creation failed', error });
  }
};


exports.getPaymentHistoryByStudentId = async (req, res) => {
    try {
      const { studentId } = req.params;
      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      const payments = await Payment.find({ studentId });
      res.status(200).json({ message: 'Payment history retrieved successfully', payments });
    } catch (error) {
      res.status(400).json({ message: 'Payment history retrieval failed', error });
    }
  };