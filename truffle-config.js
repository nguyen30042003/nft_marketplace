const HDWalletProvider = require('@truffle/hdwallet-provider');
const keys = require('./keys.json');

module.exports = {
  contracts_build_directory: "./public/contracts",

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },

    sepolia: {
      provider: () => new HDWalletProvider(
        [keys.DEPLOYER_KEY], // dùng mảng
        keys.INFURA_SEPOLIA_URL // dù tên là "INFURA_SEPOLIA_URL", đây là RPC của Alchemy
      ),
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 10000000000,
      confirmations: 2,
      timeoutBlocks: 300,
      skipDryRun: true
    }
  },

  compilers: {
    solc: {
      version: "0.8.13",
      settings: {
        optimizer: {
          enabled: true,
          runs: 50
        }
      }
    }
  }
};
