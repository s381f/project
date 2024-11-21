const mongoose = require("mongoose");
const {userSchema} = require("../models/user");
const {bookSchema} = require("../models/book");
const mongoDBUrl = process.env.MONGODB_URI || "mongodb://localhost:27017"

mongoose.connect(mongoDBUrl).then();
const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);

module.exports = {
  mongoose,
  User,
  Book
}
