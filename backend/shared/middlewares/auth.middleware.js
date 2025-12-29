// middlewares/authJwt.js
const jwt = require('jsonwebtoken');
const Client = require('../../features/users/client.model');
const Lawyer = require('../../features/lawyers/lawyer.model');
const User = require('../../features/users/user.model');

exports.verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check role to optimize, otherwise try all
    let user = null;
    if (decoded.role === 'client') {
      user = await Client.findById(decoded.id).select('-passwordHash');
    } else if (decoded.role === 'lawyer') {
      user = await Lawyer.findById(decoded.id).select('-passwordHash');
    } else {
      user = await User.findById(decoded.id).select('-passwordHash'); // Admin
    }

    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.isBanned) return res.status(403).json({ message: 'Account is banned' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// roleGuard moved to shared/middlewares/role.middleware.js
