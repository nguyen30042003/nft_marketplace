// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Roles.sol";

contract AccessManage {
    using Roles for Roles.Role;

    // Define roles
    Roles.Role private users;
    Roles.Role private verifiers;
    Roles.Role private admins;
    Roles.Role private staffs;

    // Mapping từ address nhân viên tới tổ chức verifier quản lý
    mapping(address => address) private staffToVerifier;
    mapping(address => address[]) private verifierToStaffs;


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
        string memory tokenURI,
        string memory role
    ) public {
        require(account != address(0), "Invalid address");
        require(!users.has(account), "User already exists");
        userInfo[account] = User(name, email, tokenURI);
        if (keccak256(abi.encodePacked(role)) == keccak256("VERIFIER")) {
            verifiers.add(account);
        } else if (keccak256(abi.encodePacked(role)) == keccak256("ADMIN")) {
            admins.add(account);
        } else if (keccak256(abi.encodePacked(role)) == keccak256("USER")) {
            users.add(account);
        } else {
            revert("Invalid role");
        }
        emit UserAdded(account, name, email);
        //emit RoleAssigned(account, role);
    }

    // Assign a role
    function assignRole(address account, string memory role) public {
        require(account != address(0), "Invalid address");

        if (keccak256(abi.encodePacked(role)) == keccak256("VERIFIER")) {
            verifiers.add(account);
        } else if (keccak256(abi.encodePacked(role)) == keccak256("ADMIN")) {
            admins.add(account);
        } else if (keccak256(abi.encodePacked(role)) == keccak256("USER")) {
            users.add(account);
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


// Thêm hàm addStaff mới để nhận thêm thông tin người dùng
    function addStaff(
        address staffAccount,
        string memory name,
        string memory email,
        string memory tokenURI
    ) public {
        require(
            admins.has(msg.sender) || verifiers.has(msg.sender),
            "Only admin or verifier can add staff"
        );
        require(!staffs.has(staffAccount), "Already a staff");

        staffs.add(staffAccount);

        // Lưu thông tin người dùng vào mapping
        userInfo[staffAccount] = User(name, email, tokenURI);

        // Nếu người gọi là verifier, gán verifier đó làm chủ quản lý staff
        if (verifiers.has(msg.sender)) {
            staffToVerifier[staffAccount] = msg.sender;
            verifierToStaffs[msg.sender].push(staffAccount);
        }

        emit RoleAssigned(staffAccount, "STAFF");
    }


    function removeStaff(address staffAccount) public {
        require(staffs.has(staffAccount), "Not a staff");

        address ownerVerifier = staffToVerifier[staffAccount];

        // Chỉ admin hoặc verifier chủ của staff mới được phép xoá
        require(
            admins.has(msg.sender) || msg.sender == ownerVerifier,
            "Not authorized to remove this staff"
        );

        staffs.remove(staffAccount);
        staffToVerifier[staffAccount] = address(0);

        // Nếu là verifier thì xoá staff khỏi danh sách
        if (msg.sender == ownerVerifier) {
            address[] storage staffList = verifierToStaffs[msg.sender];
            for (uint i = 0; i < staffList.length; i++) {
                if (staffList[i] == staffAccount) {
                    staffList[i] = staffList[staffList.length - 1];
                    staffList.pop();
                    break;
                }
            }
        }

        emit RoleRemoved(staffAccount, "STAFF");
    }

    function isStaff(address account) public view returns (bool) {
        return staffs.has(account);
    }

    function getVerifierOfStaff(address staff) public view returns (address) {
        require(staffs.has(staff), "Not a staff");
        return staffToVerifier[staff];
    }


    function getStaffsOfVerifier(address verifier) public view returns (address[] memory) {
        require(verifiers.has(verifier), "Not a verifier");
        return verifierToStaffs[verifier];
    }


}