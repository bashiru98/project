const express = require("express")
const {
getLatency  
  } = require('../controllers/latency');


const router = express.Router();

router.get("/", getLatency)

module.exports = router;