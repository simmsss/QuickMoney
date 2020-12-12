const QuickMoney = artifacts.require("QuickMoney");

// Deploy QuickMoney contract
module.exports = function(deployer) {
  deployer.deploy(QuickMoney);
};