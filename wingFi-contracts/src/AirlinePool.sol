// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./GlobalPool.sol";
import "./interfaces/IPool.sol";

contract AirlinePool is GlobalPool {
    using SafeERC20 for IERC20;
    string public airlineCode;
    address public globalPoolAddress;
    
    event FallbackToGlobalPool(address indexed user, uint256 amount);
    
    error GlobalPoolNotSet();
    
    constructor(
        address _stablecoin,
        address _oracleAdapter,
        string memory _airlineCode,
        address _globalPoolAddress
    ) GlobalPool(_stablecoin, _oracleAdapter) {
        airlineCode = _airlineCode;
        globalPoolAddress = _globalPoolAddress;
    }
    
    function setGlobalPoolAddress(address _globalPoolAddress) external onlyOwner {
        globalPoolAddress = _globalPoolAddress;
    }
    
    function payout(address to, uint256 amount) external override onlyOracle nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        if (totalLiquidity >= amount) {
            totalLiquidity -= amount;
            totalPayouts += amount;
            stablecoin.safeTransfer(to, amount);
            emit Payout(to, amount);
        } else {
            if (globalPoolAddress == address(0)) {
                revert GlobalPoolNotSet();
            }
            
            uint256 remainingAmount = amount - totalLiquidity;
            
            if (totalLiquidity > 0) {
                totalPayouts += totalLiquidity;
                stablecoin.safeTransfer(to, totalLiquidity);
                totalLiquidity = 0;
                emit Payout(to, totalLiquidity);
            }
            
            IPool(globalPoolAddress).payout(to, remainingAmount);
            emit FallbackToGlobalPool(to, remainingAmount);
        }
    }
}

