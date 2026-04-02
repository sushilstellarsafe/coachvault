const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ msg: "No token" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded; // id + role
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
};