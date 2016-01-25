var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
  rating: { type: Number },
  courseName: { type: String }
});

module.exports = mongoose.model('Review', reviewSchema);
