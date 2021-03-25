const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

exports.register = asyncHandler(async (req, res, next) => {
  const { email, password} = req.body;

  // Create user
  const user = await User.create({
    email,
    password,
  });

  sendTokenResponse(user, 200, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('User does not exist', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid password', 401));
  }

  sendTokenResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      data: {},
    });
  });
  
exports.getInfo = asyncHandler(async (req, res, next) => {
  // user is already available in req due to the protect middleware
  const user = req.user;
 const userInfo = await User.findOne({ _id:user.id}).select('-password')

  res.status(200).json({
    success: true,
    data: userInfo,
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshJwtToken()
  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
  });
};
