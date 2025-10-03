const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Remove "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ message: "Invalid Token", error: err.message });
  }
};

module.exports = verifyToken;
