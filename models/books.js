var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Books = new Schema({
  admin: {type: String, unique: true},
  library: []
});

module.exports = mongoose.model('Books', Books);
