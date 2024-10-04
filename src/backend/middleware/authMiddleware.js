const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (authHeader) {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Unauthorized: Invalid token" });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized: No token provided" });
  }
};

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (authHeader) {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Unauthorized: Invalid token" });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({message: "Unauthorized: Requires Admin permissions"});
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized: No token provided" });
  }
};

module.exports = {
  verifyToken,
  verifyAdminToken
}
