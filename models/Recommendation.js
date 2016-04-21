var mongoose = require('mongoose');

var recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  class: String,
  rating: String
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
