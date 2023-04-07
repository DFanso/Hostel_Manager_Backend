const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  // Add your parent schema properties here
});

module.exports = mongoose.model('Parent', parentSchema);
