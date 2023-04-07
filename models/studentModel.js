const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Add your student schema properties here
});

module.exports = mongoose.model('Student', studentSchema);
