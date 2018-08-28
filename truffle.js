/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require("truffle-hdwallet-provider");

const privateKey = "enough garment twice cake add purity identify tumble addict income egg orange"; // private keys

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    // Mnemonic:      element inner stomach bamboo mirror police glimpse question deputy taste sleep over
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      from: "0x5327f16c6cbf0804a077b8513037704e12640e98"
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(privateKey, "https://rinkeby.infura.io/v3/6c20019c5b2948bf8d85c96728423735")
      },
      network_id: 4
    }
  }
};
