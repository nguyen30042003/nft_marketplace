// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Roles.sol";

contract AccessManage {
    using Roles for Roles.Role;

    // Define roles
    Roles.Role private users;
    Roles.Role private verifiers;
    Roles.Role private admins;


    // User data structure
    struct User {
        string name;
        string email;
        string tokenURI;
    }

    // Mapping from address to user data
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

    // Constructor
    constructor() {
        admins.add(msg.sender); // Deployer becomes the first admin
    }

    // Add a user
    function addUser(
        address account,
        string memory name,
        string memory email,
        string memory tokenURI
    ) public onlyAdmin {
        require(account != address(0), "Invalid address");
        require(!users.has(account), "User already exists");

        users.add(account);
        userInfo[account] = User(name, email, tokenURI);

        emit UserAdded(account, name, email);
        //emit RoleAssigned(account, "User");
    }

    // Assign a role
    function assignRole(address account, string memory role) public onlyAdmin {
        require(account != address(0), "Invalid address");

        if (keccak256(abi.encodePacked(role)) == keccak256("Verifier")) {
            verifiers.add(account);
        } else if (keccak256(abi.encodePacked(role)) == keccak256("Admin")) {
            admins.add(account);
        } else {
            revert("Invalid role");
        }

        emit RoleAssigned(account, role);
    }

    // Remove a role
    function removeRole(address account, string memory role) public onlyAdmin {
        require(account != address(0), "Invalid address");

        if (keccak256(abi.encodePacked(role)) == keccak256("Verifier")) {
            verifiers.remove(account);
        } else if (keccak256(abi.encodePacked(role)) == keccak256("Admin")) {
            admins.remove(account);
        } else {
            revert("Invalid role");
        }

        emit RoleRemoved(account, role);
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
        require(users.has(account), "User does not exist");
        User memory user = userInfo[account];
        return (user.name, user.email, user.tokenURI);
    }

    // Check roles
    function isAdmin(address account) public view returns (bool) {
        return admins.has(account);
    }

    function isVerifier(address account) public view returns (bool) {
        return verifiers.has(account);
    }

    function isUser(address account) public view returns (bool) {
        return users.has(account);
    }
}