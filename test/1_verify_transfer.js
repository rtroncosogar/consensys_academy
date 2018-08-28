var FreeDaysManager = artifacts.require("./FreeDaysManager/FreeDaysManager.sol");
var FreeDaysToken = artifacts.require("./Tokens/FreeDaysToken.sol");

// WALLETS:
//const WALLET_ZEUS        = "0x5327f16c6cbf0804a077b8513037704e12640e98"; // accounts[0]
//const WALLET_API         = "0xc51ac193d46bfd6b625d28888a46e31fb345b6f4"; // accounts[1]

//const WALLET_ICO         = "0x49ab72e6ba823ca381ad976ddff197d773e5e226"; // accounts[7]
//const WALLET_GROWTH      = "0xb4cb62468badedc65a0f23abf9b0a337f43d2def"; // accounts[8]
//const WALLET_PARTNERSHIP = "0x940b5e8709166c87ce5b2243a7e26b1e7a757aef"; // accounts[9]

//const TEST_TOKEN_WALLET  = "0x09a01f86f501b0c26f5ffCD7E4E7A78A82Ebb284"; // main Wallet Angelo
//const TEST_ETH_WALLET    = "0x1b7794c58f22b79b6a4af4185ff6ec77d5bd4a35"; // accounts[2]
//const TEST_BTC_WALLET    = "1PDKzemk1DVVvF2PF5UJbtEny9E4g64uVU"; // secret: "L38oUpKhDQJboWEf1pBwT1uhTRF6xbPvTgdr3ff6K9p4QpTRf9vf"

// QUANTITIES:

contract('Verify Transfers', function(accounts) {

    const WALLET_MANAGER = accounts[9];

    const WALLET_DONOR_1 = accounts[8];
    const WALLET_REQUESTOR_1 = accounts[7];

    it("Crontract must be able to transfer days to a donor", async function () {
        // recover the contracts:
        var fdt = await FreeDaysToken.deployed();
        var fdm = await FreeDaysManager.deployed();
        // configure the crowdsale:
        await fdm.giveDaysToDonor(WALLET_DONOR_1, 10, {from: WALLET_MANAGER});

        var txResponse = await fdt.balanceOf(WALLET_DONOR_1);
        // start the stage 1:
        //console.log("resultado: ", txResponse);

        assert.equal(txResponse.toNumber(), 10, "Donor must have 10 available days");
    });

    it("Contract must be able to registrate a requestor", async function () {
        // recover the contracts:
        var fdt = await FreeDaysToken.deployed();
        var fdm = await FreeDaysManager.deployed();
        // registrate a requestor
        await fdm.registrateRequestor(WALLET_REQUESTOR_1, 10, {from: WALLET_MANAGER});

        var txResponse = await fdm.requestors.call(0);
        // start the stage 1:
        //console.log("resultado: ", txResponse);
        assert.equal(txResponse, WALLET_REQUESTOR_1, "Requestor must be listed in requestors array");

        txResponse = await fdm.requirements.call(WALLET_REQUESTOR_1);

        assert.equal(txResponse.toNumber(), 10, "Requestor must have a pending request of 10 days");

        await fdm.takeDays(WALLET_REQUESTOR_1, 4, {from: WALLET_MANAGER});

        txResponse = await fdm.requirements.call(WALLET_REQUESTOR_1);

        assert.equal(txResponse.toNumber(), 6, "After takeDays, requestor must have a pending request of 6 days");

    });

    it("Donor must be able to transfer to a requestor", async function() {
        
        
        var fdt = await FreeDaysToken.deployed();
        var fdm = await FreeDaysManager.deployed();

        // collect donor status:
        var balanceDonorInitial = await fdt.balanceOf(WALLET_DONOR_1);
        var balanceRequestorInitial = await fdt.balanceOf(WALLET_REQUESTOR_1);

        // registrate a requestor
        await fdm.registrateRequestor(WALLET_REQUESTOR_1, 10, {from: WALLET_MANAGER});
        // give days to donor
        await fdm.giveDaysToDonor(WALLET_DONOR_1, 10, {from: WALLET_MANAGER});
        // donor must be able to transfer
        await fdt.transfer(WALLET_REQUESTOR_1, 10, {from: WALLET_DONOR_1});

        // collect donor status:
        var balanceDonorFinal = await fdt.balanceOf(WALLET_DONOR_1);
        var balanceRequestorFinal = await fdt.balanceOf(WALLET_REQUESTOR_1);

        var d_Donor = balanceDonorFinal - balanceDonorInitial;
        var d_Requestor = balanceRequestorFinal - balanceRequestorInitial;

        console.log("##########################");
        console.log(d_Donor);
        console.log("##########################");
        console.log(d_Requestor);
        console.log("##########################");

        assert.equal((d_Requestor), 10, "Requestor must have the days");
        assert.equal((d_Donor+d_Requestor), 10, "System must keep total supply");

    });

});