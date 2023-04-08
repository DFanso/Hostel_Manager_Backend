const Student = require('../models/studentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



exports.payFees = (req, res) => {
  // Handle student fee payment
};

exports.studentLogin = async (req, res) => {
    try {
      console.log('Login request received'); // Add this line
      const { email, password,studentId } = req.body;
      const student = await Student.findOne({ email });
  
      if (!student) {
        console.log('Invalid email'); // Add this line
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        console.log('Invalid password'); // Add this line
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ _id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Login successful'); // Add this line
      res.status(200).json({ message: 'Login successful', token ,studentId: student.studentId});
    } catch (error) {
      console.error('Login failed:', error); // Add this line
      res.status(500).json({ message: 'Login failed', error });
    }
  };
  
  exports.register = async (req, res) => {
    try {
      console.log('Registration request received'); // Add this line
      const student = new Student(req.body);
      await student.save();
      console.log('Registration successful'); // Add this line
      res.status(201).json({ message: 'Student registration successful', student });
    } catch (error) {
      console.error('Registration failed:', error); // Add this line
      res.status(400).json({ message: 'Student registration failed', error });
    }
  };