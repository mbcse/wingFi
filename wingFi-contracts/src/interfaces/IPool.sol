// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPool {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getLPBalance(address user) external view returns (uint256);
    function payout(address to, uint256 amount) external;
    function getPoolTVL() external view returns (uint256);
    function collectPremium(address from, uint256 amount) external;
}

