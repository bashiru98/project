const express =require('express');
const {
  register,
  login,
  logout,
  getInfo,
  
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login',login);
router.get('/logout/:all',protect, logout);
router.get('/info', protect, getInfo);


module.exports = router;