const asyncHandler = require("../middleware/async");
const ping = require('jjg-ping');

exports.getLatency = (req,res) => {
    // ping google.com for latency
    ping.system.ping('google.com', function(latency, status) {
        if (status) {
           return res.status(200).json({latency:`${latency} milliseconds`})
        }
        else {
        return res.status(500).json({message:" Google server down"})
        }
    })

}

