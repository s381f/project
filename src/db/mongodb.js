const mongoose = require("mongoose");
const {userSchema} = require("../models/user");
const mongoDBUrl = process.env.MONGODB_URI || "mongodb://localhost:27017"

mongoose.connect(mongoDBUrl).then();
const User = mongoose.model("User", userSchema);

module.exports = {
  mongoose,
  User
}
