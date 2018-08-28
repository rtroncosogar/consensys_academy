var FreeDaysToken = artifacts.require("./Tokens/FreeDaysToken.sol");
var FreeDaysManager = artifacts.require("./FreeDaysManager/FreeDaysManager.sol");

// WALLETS:
var WALLET_MANAGER;

// QUANTITIES:
const INITIAL_DAYS = 1000000000000;


module.exports = function(deployer, network, accounts) {
    //var freeDays;
    //var crowdsaleInstance;
    
    WALLET_MANAGER = accounts[9];//"0x99E1ab7A96D0b7d1a330DC84a6bCD98581Cc4cdA";//accounts[9];

    var tokenInstance;
    var managerInstance;

    // Deploy freeDays:
    deployer.deploy(FreeDaysToken, INITIAL_DAYS, "FreeDaysToken", 0, "FDT").then(() => {
        return FreeDaysToken.deployed();
    }).then((instance) => {
        // Recover instance of FreeDaysToken
        tokenInstance = instance;
        // Deploy Manager Contract
        return deployer.deploy(FreeDaysManager, tokenInstance.address, WALLET_MANAGER);
    }).then(() => {
        return FreeDaysManager.deployed();
    }).then((instance) => {
        managerInstance = instance;
        // Transfer the freeDays to the Admin:
        return tokenInstance.transfer(managerInstance.address, INITIAL_DAYS);
    }).then((txHash) => {

        console.log('==========================[ Addresses ]======================================');
        console.log('FreeDaysToken Contract:    ' + tokenInstance.address);
        console.log('FreeDaysManager Contract:  ' + managerInstance.address);
        console.log('ADMIN wallet:              ' + WALLET_MANAGER);
        /*console.log('-----------------------[ Truste Balances ]----------------------------------');
        console.log('Zeus:                    ' + balance_Zeus);
        console.log('Crowdsale:               ' + balance_Crowdsale);
        console.log('ICO Wallet:              ' + balance_ICO);
        console.log('Growth Wallet:           ' + balance_Growth);
        console.log('Partnership Wallet:      ' + balance_Partnership);
        console.log('------------------------[ Ether Balances ]----------------------------------');
        console.log('Zeus:                    ' + web3.eth.getBalance(WALLET_ZEUS));
        console.log('Crowdsale:               ' + web3.eth.getBalance(crowdsaleInstance.address));
        console.log('ICO Wallet:              ' + web3.eth.getBalance(WALLET_ICO));
        console.log('Growth Wallet:           ' + web3.eth.getBalance(WALLET_GROWTH));
        console.log('Partnership Wallet:      ' + web3.eth.getBalance(WALLET_PARTNERSHIP));
        console.log('-----------------------[ Deployment Cost ]----------------------------------');
        console.log('Final Deploy Cost:       ' + (init_balance - web3.eth.getBalance(WALLET_ZEUS)));
        console.log('============================================================================');*/
    });

};