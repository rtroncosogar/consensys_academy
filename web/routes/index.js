var express = require('express');
var router = express.Router();
var uportConnect = require("uport-connect");
var jsontokens = require("jsontokens");


const Authorization = require("../models/authorization.js");

const mnidAddress = '2opTzLFqZKBvRMTw6bYZVA3a8HiFjFtCMuX';
const signingKey = '617eda371862de4816fb46850588c250465e6c534600845b70e2977613fe09de';
const appName = 'DEx';

const signer = uportConnect.SimpleSigner(signingKey);
const endpoint = "http://54.233.197.195"; //"http://www.clpt.cl";

const credentials = new uportConnect.Credentials({
  appName: appName,
  address: mnidAddress,
  signer: signer
});

async function authorizeToken(authToken, response) {
  const foundAuth = await Authorization.findOne({authToken: authToken});
  // if previously authorized, renew:
  if(foundAuth != undefined) {
    const id = foundAuth._id;

    Authorization.findByIdAndUpdate(id, {
      emissionTime: Date(Date.now),
      duration: 60
    }, function(err, data) {
      if(err) {
        response({
          status: "error",
          extra: err
        });
        return;
      }
      response({
        status: "ok",
        exra: data
      });
    });
    return;
  }
  // in other case, create:
  const auth = new Authorization({authToken});
  auth.save((err, data) => {
      if(err) {
          response({
              status: "error",
              extra: err
          });
          return;
      }
      response({
          status: "ok",
          extra: data
      });
  });
};

async function isUserAuthorized(authToken) {
  //var isAuthorized = false;
  // nothing passed
  if(authToken == undefined) {
    //res.json({status: 'Unauthorized'});
    return false;
  }

  const foundAuth = await Authorization.findOne({authToken});

  // not found:
  if(foundAuth == undefined) {
    /*res.json({
      token: authToken,
      status: "Unauthorized"
    });*/
    return false;
  }

  var currentDate = new Date(Date.now());
  var testDate = new Date((new Date(Date.parse(foundAuth.emissionTime)).getTime() + (1000*foundAuth.duration)));
  // expired?
  if(currentDate > testDate) {
    /*res.json({
      token: foundAuth,
      testDate,
      currentDate,
      status: "Unauthorized"
    });*/
    return false;
  }
  return true;

  // Alles gut?
  //res.redirect("/");
  /**/
};

/* Requestor Service. */
router.get('/', function(req, res, next) {
  // Generate a token to link uPort response with user interface:
  require('crypto').randomBytes(48, function(err, buffer) {
    var linkToken = buffer.toString('hex');

    // generation of uPort Request Token:
    credentials.createRequest({
      requested: ["name"],
      callbackUrl: `${endpoint}/callback?token=${linkToken}`,
      exp: Math.floor(new Date().getTime()/1000) + 300 // give 5 minutes to expire
    }).then(requestToken => {
      let uri = 'me.uport:me?requestToken=' + requestToken;// + '%26callback_type=post';
      const qrCode = uportConnect.QRUtil.getQRDataURI(uri);
      let mobileUrl = 'https://id.uport.me/me?requestToken=' + requestToken + '&callback_type=post';
      //let qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri;
      res.render('index', {loginQr: qrCode, loginMobile: mobileUrl, linkToken: linkToken});
      console.log("############[ new visit ]############");
      console.log(linkToken);
      console.log("#####################################");
    });
  });
});

router.get('/login', async(req,res) => {
  const authToken = req.query.token;

  if(await isUserAuthorized(authToken)) {
    // Load user information:

    // render user view:
    res.render('user_main', {authToken});
  } else {
    res.redirect("/");
  }
});




router.post('/callback', function(req, res) {
  let jwt = req.body.access_token;
  let linkToken = req.query.token;

  if(jwt == undefined) {
    // user rejected login:
    console.log("[[ USER REJECTED LOGIN ]]");
    return;
  }

  // user accepted login:
  credentials.receive(jwt).then(function(creds) {
    console.log("##########[ USER LOGGED IN ]##########");
    console.log(creds);
    console.log(linkToken);
    console.log("######################################");
    authorizeToken(linkToken, (result) => {
      console.log("##########[ REGISTRATION ]##########");
      console.log(result);
      console.log("######################################");
    });
  });
});

router.get('/amiauthorized', async(req, res) => {
  const authToken = req.query.token;

  if(await isUserAuthorized(authToken)) {
    res.json({
      status: "Authorized"
    });
  } else {
    res.json({
      status: "Unauthorized"
    });
  }
});

module.exports = router;
