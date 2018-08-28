const Token = require("./models/token");
const User  = require("./models/user");

function respondUnauthorized(res) {
    res.status(401);
    return res.render("unauthorized");
}


module.exports = async function(req, res, next) {
    var token = req.body.auth || req.query.auth;
    var address = req.body.account || req.query.account;

    console.log("Token:",token);
    console.log("Wallet:",address);

    // if nothing was passed:
    if(token == undefined || address == undefined) {
        console.log(token);
        console.log(address);
        return respondUnauthorized(res);
    }

    // check if the token is registered:
    const foundToken = await Token.findOne({token: token});

    // no entry found:
    if(foundToken == undefined) {
        return respondUnauthorized(res);
    }

    // if entry was found, first check that ip corresponds:
    if(foundToken.associatedIP != req.connection.remoteAddress) {
        return respondUnauthorized(res);
    }

    // check that the token has been assigned:
    console.log("Associated Address: ", foundToken.associatedAddress != "0x0");
    if(foundToken.associatedAddress != "0x0") {
        // if token is assined, then check that the owner is in parameter:
        if(foundToken.associatedAddress == address) {
            var currentDate = new Date(Date.now());
            var testDate = new Date((new Date(Date.parse(foundToken.creationTime)).getTime() + (1000*foundToken.duration)));
            // check if token is not Active:
            if(currentDate > testDate || !foundToken.isActive) {
                return respondUnauthorized(res);
            }
            // all good, it's authorized:
            next();
        } else {
            // otherwise, this token doesnt belong to the user:
            return respondUnauthorized(res);
        }
    } else {
        // if the token hasn't been assigned, then assign to current user:
        Token.findByIdAndUpdate(foundToken._id, {
            creationTime: Date(Date.now),
            isActive: true,
            associatedAddress: address
        }, function(err, data) {
            if(err) {
                console.log("There was an error while finishing the token registration");
                return;
            }
            console.log("Token successfuly registrated, now ready to be used");
            createOrUpdateUser(foundToken.token, address, foundToken.sessionType, next);
        });
    }
    
};

async function createOrUpdateUser(token, wallet, accountType, next) {
    const foundUser = await User.findOne({wallet: wallet});

    console.log(accountType);

    // if entry found:
    if(foundUser != undefined) {
        // update info:
        User.findByIdAndUpdate(foundUser._id, {
            authToken: token,
            wallet: wallet
        }, function(err, data) {
            if(err) {
                console.log("There was an error while updating the user info");
                return;
            }
            console.log("User updated to new token");
            next();
        });
    } else {
        // if no entry of user is found, then create the user:
        const user = new User({
            authToken: token,
            wallet: wallet,
            accountType: accountType
        });
        user.save((err,data) => {
            if(err) {
                console.log("There was an error while creating the user entry", data);
                return;
            }
            console.log("User created with a valid token");
            next();
        });
    }
}

