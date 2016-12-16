var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var User = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  firstname: String,
  lastname: String,
  city: String,
  state: String,
  books: [],
  trades: {
    traderequests: [],
    mytrades: []
  }
});

User.methods.encryptPassword = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

User.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', User);
