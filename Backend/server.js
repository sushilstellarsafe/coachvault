const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/", require("./routes/auth"));
app.use("/upload", require("./routes/upload"));
app.use("/uploads", express.static("uploads"));
app.use("/notes", require("./routes/notes"));


// DB Connect
mongoose.connect("mongodb+srv://myuser:Sushil@cluster1.jvuxleh.mongodb.net/coachingApp")
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));