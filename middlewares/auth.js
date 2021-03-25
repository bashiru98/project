const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  let refreshToken;

  if (
    req.headers.x-auth-token
  ) {
    // Set token from Bearer token in header
    token = req.headers['x-auth'].split(' ')[1];
    
    
  }
  
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

   
  } catch (err) {
    // create new refresh token 
     refreshToken = req.headers['x-refresh-token'];
    const newTokens = await refreshTokens(token, refreshToken, models, SECRET, SECRET_2);
    if (newTokens.token && newTokens.refreshToken) {
      res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
      res.set('x-token', newTokens.token);
      res.set('x-refresh-token', newTokens.refreshToken);
    }
    req.user = newTokens.user;
    
}

next();

});
