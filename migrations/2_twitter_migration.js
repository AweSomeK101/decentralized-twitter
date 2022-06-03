const tweets = artifacts.require("tweets");

module.exports = function (deployer) {
  deployer.deploy(tweets);
};
