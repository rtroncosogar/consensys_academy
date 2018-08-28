var express = require('express');
var router = express.Router();

var fs = require("fs");
var path = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index2', { title: 'DEx'/*, loginQr: qrCode, loginMobile: mobileUrl*/});
    
});

var abi_FreeDaysToken = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "build", "contracts", "FreeDaysToken.json"), 'utf8')).abi;
var abi_FreeDaysManager = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "build", "contracts", "FreeDaysManager.json"), 'utf8')).abi;

router.get('/abi_fdt.json', function(req, res) {
    res.send(abi_FreeDaysToken);
});

router.get('/abi_fdm.json', function(req, res) {
    res.send(abi_FreeDaysManager);
});


module.exports = router;
