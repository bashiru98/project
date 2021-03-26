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

  sendTokenResponse(user, 200,res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
 

  // Validate email & password
  if (!email && !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email })

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

  const option = JSON.parse(req.params.all) ==true ? {$set:{refreshToken:" none",currentToken:"none "}}:{$set:{currentToken:"none"}}

  const user = await User.findOneAndUpdate({_id:req.user.id},option,{new:true})

    res.status(200).json({
      success: true,
      data: {
        token:user.currentToken,
        refreshToken:user.refreshToken,
      },
    });
  });
  
exports.getInfo = asyncHandler(async (req, res, next) => {
  // user is already available in req due to the protect middleware
  const user = req.user;
 const userInfo = await User.findOne({ _id:user.id}).select(['-password', '-refreshToken', '-currentToken',"-__v"])

  res.status(200).json({
    success: true,
    data: userInfo,
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = asyncHandler (async(user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();
  await User.findOneAndUpdate({_id:user._id}, {$set:{refreshToken,currentToken:token}})
  res.status(statusCode).json({
    
    success: true,
    token,
    refreshToken,
  });
});
