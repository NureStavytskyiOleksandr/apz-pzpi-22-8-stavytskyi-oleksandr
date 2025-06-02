const jwt = require('jsonwebtoken');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.user_id || !decoded.role) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied: insufficient role' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message); // Логування помилки
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = restrictTo;
