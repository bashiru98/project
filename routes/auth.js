const express = require('express');
const {
  register,
  login,
  logout,
  getInfo,
  
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getInfo);


module.exports = router;