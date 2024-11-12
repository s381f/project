const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {type: String, required: true, index: true},
  username: {type: String, required: true, min: 6},
  password: {type: String, required: true, min: 6},
});

module.exports = userSchema;
