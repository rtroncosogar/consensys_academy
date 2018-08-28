const express = require('express');
const router = express.Router();
const MetaAuth = require('meta-auth');

var   Token  = require("../models/token.js");
var   User   = require("../models/user.js");

var metaAuth = new MetaAuth({
    signature: 'MetaSignature',
    message: 'MetaMessage',
    address: 'MetaAddress',
    banner: 'DEx Login'
  });

async function createSessionToken(token, ip, type, response) {
    // find if its not already created:
    const foundAuth = await Token.findOne({token: token});
    // if its already created, renew:
    if(foundAuth != undefined) {
        const id = foundAuth._id;

        Token.findByIdAndUpdate(id, {
            creationTime: Date(Date.now),
            associatedIP: ip,
            isActive: false,
            sessionType: type,
            associatedAddress: "0x0"
        }, function(err, data) {
            if(err) {
                response("error", err);
                return;
            }
            response("ok", data);
        });
        return;
    }

    // in other case, create the token:
    const auth = new Token({
        token: token,
        associatedIP: ip,
        isActive: false,
        sessionType: type
    });
    auth.save((err, data) => {
        if(err) {
            response("error", err)
            return;
        }
        response("ok", data);
    });
};

router.get('/:MetaAddress', metaAuth, (req, res) => {
    // Request a message from the server
    let type = req.query.type;
    console.log(type);
    if(type != "donor" && type != "requestor") {
      // render the error page
      res.status(err.status || 500);
      res.render('error');
      return;
    };

    if (req.metaAuth && req.metaAuth.challenge) {

        var challenge = req.metaAuth.challenge[1].value;
        var remoteIP  = req.connection.remoteAddress;

        if(type === "donor") {
            // register a pending login for a donor:
            createSessionToken(challenge,remoteIP,"donor", (result, data) => {
                if(result != "error") {
                    // request metamask authentication:
                    res.send(req.metaAuth.challenge);   
                } else {
                    console.log("There was an error while creating session token", data)
                }
            });
        } else if(type === "requestor") {
            // register a pending login for a requestor:
            createSessionToken(challenge,remoteIP,"requestor", (result, data) => {
                if(result != "error") {
                    // request metamask authentication:
                    res.send(req.metaAuth.challenge);
                } else {
                    console.log("There was an error while creating session token", data);
                }
            });
        }
    }
  });
  
  router.get('/:MetaMessage/:MetaSignature', metaAuth, (req, res) => {
    if (req.metaAuth && req.metaAuth.recovered) {
      // Signature matches the cache address/challenge
      // Authentication is valid, assign JWT, etc.

      res.send(req.metaAuth.recovered);
      //res.redirect("/user");
      //console.log("authentication is valid");
    } else {
      // Sig did not match, invalid authentication
      res.status(400).send();
      console.log("authentication is invalid");
    };
  });



module.exports = router;
