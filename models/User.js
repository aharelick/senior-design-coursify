var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, trim: true}
});

module.exports = mongoose.model('User', userSchema);
