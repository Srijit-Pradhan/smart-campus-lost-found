import jwt from 'jsonwebtoken';

// Middleware to protect routes that require authentication
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user ID from payload to the request object so next functions can use it
      // We do not fetch the full user from DB here to keep it fast, unless necessary
      req.user = { id: decoded.id };

      next(); // Move to the next middleware or controller
    } catch (error) {
      console.error('Not authorized, token failed');
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token at all
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
