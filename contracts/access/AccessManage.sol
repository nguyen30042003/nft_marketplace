// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Roles.sol";

contract AccessManage {
    using Roles for Roles.Role;

    // Define roles
    Roles.Role private users;
    Roles.Role private verifiers;
    Roles.Role private admins;
    Roles.Role private members;

    // Mapping từ address member tới tổ chức verifier quản lý
    mapping(address => address) private memberToVerifier;
    mapping(address => address[]) private verifierToMembers;

    // User data structure
    struct User {
        string name;
        string email;
        string tokenURI;
    }

    mapping(address => User) private userInfo;

    // Events
    event UserAdded(address indexed account, string name, string email);
    event RoleAssigned(address indexed account, string role);
    event RoleRemoved(address indexed account, string role);

    // Modifiers
    modifier onlyAdmin() {
        require(admins.has(msg.sender), "Only admin can perform this action");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers.has(msg.sender), "Only verifier can perform this action");
        _;
    }

    modifier onlyAdminOrVerifier() {
        require(admins.has(msg.sender) || verifiers.has(msg.sender), "Only admin or verifier can perform this action");
        _;
    }

    // Constructor
    constructor() {
        admins.add(msg.sender); // Deployer becomes the first admin
    }

    // Add a user with role
    function addUser(
        address account,
        string memory name,
        string memory email,
        string memory tokenURI,
        string memory role
    ) public {
        require(account != address(0), "Invalid address");
        require(!users.has(account) && !verifiers.has(account) && !admins.has(account) && !members.has(account), "User already exists");

        userInfo[account] = User(name, email, tokenURI);

        if (compare(role, "VERIFIER")) {
            verifiers.add(account);
        } else if (compare(role, "ADMIN")) {
            admins.add(account);
        } else if (compare(role, "USER")) {
            users.add(account);
        } else {
            revert("Invalid role");
        }

        emit UserAdded(account, name, email);
        emit RoleAssigned(account, role);
    }

    // Assign a role
    function assignRole(address account, string memory role) public {
        require(account != address(0), "Invalid address");

        if (compare(role, "VERIFIER")) {
            verifiers.add(account);
        } else if (compare(role, "ADMIN")) {
            admins.add(account);
        } else if (compare(role, "USER")) {
            users.add(account);
        } else {
            revert("Invalid role");
        }

        emit RoleAssigned(account, role);
    }

    // Remove a role
    function removeRole(address account, string memory role) public onlyAdmin {
        require(account != address(0), "Invalid address");

        if (compare(role, "Verifier")) {
            verifiers.remove(account);
        } else if (compare(role, "Admin")) {
            admins.remove(account);
        } else {
            revert("Invalid role");
        }

        emit RoleRemoved(account, role);
    }

    // Add member (admin or verifier)
    function addMember(
        address memberAccount,
        address verifierAccount,
        string memory name,
        string memory email,
        string memory tokenURI
    ) public onlyAdminOrVerifier {
        require(memberAccount != address(0), "Invalid member address");
        require(verifiers.has(verifierAccount), "Verifier address is not a verifier");
        require(!members.has(memberAccount), "Member already exists");

        members.add(memberAccount);
        userInfo[memberAccount] = User(name, email, tokenURI);
        memberToVerifier[memberAccount] = verifierAccount;
        verifierToMembers[verifierAccount].push(memberAccount);

        emit RoleAssigned(memberAccount, "MEMBER");
    }

    // Remove member
    function removeMember(address memberAccount) public {
        require(members.has(memberAccount), "Not a member");

        address ownerVerifier = memberToVerifier[memberAccount];
        require(
            admins.has(msg.sender) || msg.sender == ownerVerifier,
            "Not authorized to remove this member"
        );

        members.remove(memberAccount);
        memberToVerifier[memberAccount] = address(0);

        // Remove from verifier's list
        address[] storage memberList = verifierToMembers[ownerVerifier];
        for (uint i = 0; i < memberList.length; i++) {
            if (memberList[i] == memberAccount) {
                memberList[i] = memberList[memberList.length - 1];
                memberList.pop();
                break;
            }
        }

        emit RoleRemoved(memberAccount, "MEMBER");
    }

    // Get user info
    function getUserInfo(address account)
        public
        view
        returns (
            string memory name,
            string memory email,
            string memory tokenURI
        )
    {
        require(users.has(account) || verifiers.has(account) || members.has(account) || admins.has(account), "User does not exist");
        User memory user = userInfo[account];
        return (user.name, user.email, user.tokenURI);
    }

    // Get member's verifier
    function getVerifierOfMember(address member) public view returns (address) {
        require(members.has(member), "Not a member");
        return memberToVerifier[member];
    }

    // Get all members of verifier
    function getMembersOfVerifier(address verifier) public view returns (address[] memory) {
        require(verifiers.has(verifier), "Not a verifier");
        return verifierToMembers[verifier];
    }

    // Role checkers
    function isAdmin(address account) public view returns (bool) {
        return admins.has(account);
    }

    function isVerifier(address account) public view returns (bool) {
        return verifiers.has(account);
    }

    function isUser(address account) public view returns (bool) {
        return users.has(account);
    }

    function isMember(address account) public view returns (bool) {
        return members.has(account);
    }

    // Internal string comparison (case sensitive)
    function compare(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
