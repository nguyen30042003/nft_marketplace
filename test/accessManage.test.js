const AccessManage = artifacts.require("AccessManage");

contract("AccessManage", (accounts) => {
  const [admin, verifier, user, nonAdmin] = accounts;

  beforeEach(async () => {
    // Triển khai contract mới trước mỗi test
    this.accessManage = await AccessManage.new();
  });

  it("should set deployer as admin", async () => {
    const isAdmin = await this.accessManage.isAdmin(admin);
    assert.isTrue(isAdmin, "Deployer should be admin by default");
  });

  it("should allow admin to add a user", async () => {
    await this.accessManage.addUser(user, "Test User", "user@example.com", "https://example.com/user");
    const isUser = await this.accessManage.isUser(user);
    assert.isTrue(isUser, "User should be added by admin");
  });

  it("should store user information correctly", async () => {
    await this.accessManage.addUser(user, "Test User", "user@example.com", "https://example.com/user");
    const userInfo = await this.accessManage.getUserInfo(user);

    assert.equal(userInfo[0], "Test User", "User name should match");
    assert.equal(userInfo[1], "user@example.com", "User email should match");
    assert.equal(userInfo[2], "https://example.com/user", "Token URI should match");
  });

  it("should allow admin to assign verifier role", async () => {
    await this.accessManage.assignRole(verifier, "Verifier");
    const isVerifier = await this.accessManage.isVerifier(verifier);

    assert.isTrue(isVerifier, "Verifier role should be assigned");
  });

  it("should allow admin to assign admin role", async () => {
    await this.accessManage.assignRole(nonAdmin, "Admin");
    const isAdmin = await this.accessManage.isAdmin(nonAdmin);

    assert.isTrue(isAdmin, "Admin role should be assigned");
  });

  it("should restrict non-admin from adding users", async () => {
    try {
      await this.accessManage.addUser(user, "Test User", "user@example.com", "https://example.com/user", { from: nonAdmin });
      assert.fail("Non-admin should not be able to add users");
    } catch (err) {
      assert.include(err.message, "Only admin can perform this action");
    }
  });

  it("should restrict non-admin from assigning roles", async () => {
    try {
      await this.accessManage.assignRole(verifier, "Verifier", { from: nonAdmin });
      assert.fail("Non-admin should not be able to assign roles");
    } catch (err) {
      assert.include(err.message, "Only admin can perform this action");
    }
  });

  it("should allow admin to remove verifier role", async () => {
    await this.accessManage.assignRole(verifier, "Verifier");
    await this.accessManage.removeRole(verifier, "Verifier");
    const isVerifier = await this.accessManage.isVerifier(verifier);

    assert.isFalse(isVerifier, "Verifier role should be removed");
  });

  it("should revert when assigning invalid role", async () => {
    try {
      await this.accessManage.assignRole(user, "InvalidRole");
      assert.fail("Should revert when assigning invalid role");
    } catch (err) {
      assert.include(err.message, "Invalid role");
    }
  });
});
