const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  roomNo: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

studentSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
