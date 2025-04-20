// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library StatusLib {
    struct StatusHistory {
        uint status;
        uint256 timestamp;
    }

    function addStatus(
        StatusHistory[] storage history,
        uint status
    ) internal {
        history.push(StatusHistory(status, block.timestamp));
    }
}