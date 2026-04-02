const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

mongoose.connect("mongodb+srv://myuser:Sushil@cluster1.jvuxleh.mongodb.net/coachingApp")

async function createUser() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await User.create({
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "admin"
  });

  await User.create({
    email: "student@gmail.com",
    password: hashedPassword,
    role: "student"
  });

  console.log("Users created");
  process.exit();
}

createUser();