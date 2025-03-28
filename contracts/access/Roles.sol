// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Roles {
    struct Role {
        mapping(address => bool) bearer;
    }

    // Add an account to a role
    function add(Role storage role, address account) internal {
        require(!has(role, account), "Roles: account already has role");
        role.bearer[account] = true;
    }

    // Remove an account from a role
    function remove(Role storage role, address account) internal {
        require(has(role, account), "Roles: account does not have role");
        role.bearer[account] = false;
    }

    // Check if an account has a role
    function has(Role storage role, address account) internal view returns (bool) {
        require(account != address(0), "Roles: account is the zero address");
        return role.bearer[account];
    }
}
