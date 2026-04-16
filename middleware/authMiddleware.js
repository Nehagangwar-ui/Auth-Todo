const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Remove "Bearer " if present
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = verified;
    next();
  } catch (err) {
    console.log("Token Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};