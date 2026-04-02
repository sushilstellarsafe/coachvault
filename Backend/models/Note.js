const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,
  fileUrl: String
});

module.exports = mongoose.model("Note", noteSchema);