const Roles = artifacts.require("Roles");
const AccessManage = artifacts.require("AccessManage");

module.exports = async function (deployer) {
    // Deploy Roles library (nếu cần)
    // deployer.deploy(Roles);

    // Deploy AccessManage contract
    await deployer.deploy(AccessManage);
};
