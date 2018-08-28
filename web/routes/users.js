var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var formidable = require('formidable');
const Eth = require('ethjs');
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");

const User = require("../models/user");
const Token = require("../models/token");

const FreeDaysToken_Contract    = "0x805966e1503500827b6eac2badaab2366b3b305b";
const FreeDaysManager_Contract  = "0x723102b2c9001d4878b2abb91dbaac891e7474bc";
const Admin_Wallet              = "0x99E1ab7A96D0b7d1a330DC84a6bCD98581Cc4cdA";
const Admin_Private             = "cec12b5468419dc12a8c0db357d574e0ced2470f9de0afd3950b02746c0b35c4";

//const privateKey = "enough garment twice cake add purity identify tumble addict income egg orange"; // private keys

let rinkebyProvider = () => {
  return new HDWalletProvider([Admin_Private], "https://rinkeby.infura.io/v3/6c20019c5b2948bf8d85c96728423735")
}

const eth = new Eth(rinkebyProvider()); //new Eth.HttpProvider('https://rinkeby.infura.io'));

var abi_FreeDaysToken = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "build", "contracts", "FreeDaysToken.json"), 'utf8')).abi;
var abi_FreeDaysManager = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "build", "contracts", "FreeDaysManager.json"), 'utf8')).abi;

var freeDaysToken   = eth.contract(abi_FreeDaysToken).at(FreeDaysToken_Contract);
var freeDaysManager = eth.contract(abi_FreeDaysManager).at(FreeDaysManager_Contract);

async function getUserByWallet(wallet) {
  const foundUser = await User.findOne({wallet: wallet});
  return foundUser;
}

async function getTokenByToken(token) {
  const foundToken = await Token.findOne({token: token});
  return foundToken;
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
  var wallet = req.body.account || req.query.account;
  var back = req.body.back || req.query.back;

  const user = await getUserByWallet(wallet);
  console.log("User: ",user);

  if(back) {
    res.json({wallet: user.wallet});
    return;
  }

  if(user.accountType == "donor") {
    console.log("Its a donor");
    res.render("user_donor", {title: "Donor", user, FreeDaysManager_Contract, FreeDaysToken_Contract});
  } else if(user.accountType == "requestor") {
    console.log("Its a requestor");
    res.render("user_requestor", {title: "Requestor", user, FreeDaysManager_Contract, FreeDaysToken_Contract});
  } else {
    console.log("Error", user.accountType);
    res.render("error");
  }
});

router.post('/upload', async function(req, res, next) {
  var wallet = req.body.account || req.query.account;

  const user = await getUserByWallet(wallet);
  const token = await getTokenByToken(user.authToken);

  var user_directory = path.join(__dirname, '..', 'uploads', user.accountType, user.wallet);

  if (!fs.existsSync(user_directory)){
    fs.mkdirSync(user_directory);
  }

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    // `file` is the name of the <input> field of type `file`
    var old_path = files.file.path,
        days = fields.days,
        file_size = files.file.size,
        file_ext = files.file.name.split('.').pop(),
        index = old_path.lastIndexOf('/') + 1,
        file_name = old_path.substr(index),
        new_path = path.join(user_directory, file_name + "_d" + days + '.' + file_ext);

    fs.readFile(old_path, function(err, data) {
        fs.writeFile(new_path, data, function(err) {
            fs.unlink(old_path, async function(err) {
                if (err) {
                    res.status(500);
                    res.json({'success': false});
                } else {

                    if(user.accountType == "requestor") {
                      var txCode = await freeDaysManager.registrateRequestor(user.wallet, days, {from: Admin_Wallet.toLowerCase()});
                      console.log("#####################################");
                      console.log(txCode);
                      console.log("#####################################");
                      res.render("user_uploaded", {title: "Requested", user, txCode});
                    } else if(user.accountType == "donor") {
                      //TODO:
                      var txCode = await freeDaysManager.giveDaysToDonor(user.wallet, days, {from: Admin_Wallet.toLowerCase()});
                      console.log("#####################################");
                      console.log(txCode);
                      console.log("#####################################");
                      res.render("donor_uploaded", {title: "Requested", user, txCode, days});
                    }
                }
            });
        });
    });
});

});

router.get('/logout', async function(req, res, next) {
  var wallet = req.body.account || req.query.account;

  const user = await getUserByWallet(wallet);
  const token = await getTokenByToken(user.authToken);

  Token.findByIdAndUpdate(token._id, {
    isActive: false
  }, function(err, data) {
    if(err) {
      console.log("Error while login out", data);
      res.json({});
      return;
    }
    console.log("User logged out");
    res.json({wallet})
    return;
  });

});

module.exports = router;
