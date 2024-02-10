// middleware/authenticate.js
const jwt = require('jsonwebtoken');
const secretKey = "thisisthesecretkeyforjwttokentoverifyusers";

function authenticateToken(req, res, next) {
  const token = req.cookies.token; // Extract the token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Missing token' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
