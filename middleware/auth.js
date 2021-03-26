const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');



// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  let refreshToken;

  if (
    req.headers['x-auth-token'] &&
    req.headers['x-refresh-token']
  ) {
    // Set token from Bearer token in header
    token = req.headers['x-auth-token'].split(' ')[1];
    refreshToken = req.headers['x-refresh-token'].split(' ')[1];;
    
  } 
  
  // Make sure token exists
  if (!token && !refreshToken) {
    return next(new ErrorResponse('No token provided', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    req.user = await User.findById(decoded.id);
    // renew token
    const newToken = req.user.getSignedJwtToken()
// update token to database
    await User.findOneAndUpdate({_id:decoded.id},{$set:{token:newToken}})

    res.set('Access-Control-Expose-Headers', 'x-auth-token');
    res.set('x-auth-token', newToken);

  } catch (err) {
     refreshToken = req.headers['x-refresh-token'].split(' ')[1];;
     if(refreshToken) {

       // Verify refreshToken  
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    const user = await User.findById(decoded.id);
   
    if(!user && {user:refreshToken}){
      // on refresh token expiry or account delete
      return next(new ErrorResponse('Please you have to login again or create a new account', 404))
    }
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
  });
    refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE
  });
    
      res.set('Access-Control-Expose-Headers', 'x-auth-token, x-refresh-token');
      res.set('x-auth-token', token);
      res.set('x-refresh-token',refreshToken);

      await User.findOneAndUpdate({_id:user._id},{$set:{token,refreshToken}})
      req.user = user;
     }  
    
}

next();

});
