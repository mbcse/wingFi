// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPool.sol";

contract GlobalPool is IPool, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable stablecoin;
    address public oracleAdapter;
    mapping(address => bool) public authorizedPools;
    
    mapping(address => uint256) public balances;
    uint256 public totalLiquidity;
    uint256 public totalPremiums;
    uint256 public totalPayouts;
    
    // Track unique LPs
    address[] private lpAddresses;
    mapping(address => bool) private isLP;
    
    event Deposit(address indexed lp, uint256 amount);
    event Withdraw(address indexed lp, uint256 amount);
    event PremiumCollected(address indexed user, uint256 amount);
    event Payout(address indexed user, uint256 amount);
    event PoolAuthorized(address indexed pool);
    
    error InvalidAmount();
    error InsufficientBalance();
    error InsufficientLiquidity();
    error UnauthorizedOracle();
    
    modifier onlyOracle() {
        if (msg.sender != oracleAdapter && !authorizedPools[msg.sender]) {
            revert UnauthorizedOracle();
        }
        _;
    }
    
    constructor(address _stablecoin, address _oracleAdapter) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        oracleAdapter = _oracleAdapter;
    }
    
    function setOracleAdapter(address _oracleAdapter) external onlyOwner {
        oracleAdapter = _oracleAdapter;
    }
    
    function authorizePool(address pool) external onlyOwner {
        authorizedPools[pool] = true;
        emit PoolAuthorized(pool);
    }
    
    function revokePool(address pool) external onlyOwner {
        authorizedPools[pool] = false;
    }
    
    function deposit(uint256 amount) external override nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        
        // Track new LP
        if (!isLP[msg.sender]) {
            isLP[msg.sender] = true;
            lpAddresses.push(msg.sender);
        }
        
        balances[msg.sender] += amount;
        totalLiquidity += amount;
        
        emit Deposit(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external override nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance();
        }
        
        balances[msg.sender] -= amount;
        totalLiquidity -= amount;
        stablecoin.safeTransfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, amount);
    }
    
    function getLPBalance(address user) external view override returns (uint256) {
        return balances[user];
    }
    
    function collectPremium(address from, uint256 amount) external override nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        stablecoin.safeTransferFrom(from, address(this), amount);
        totalPremiums += amount;
        totalLiquidity += amount;
        
        emit PremiumCollected(from, amount);
    }
    
    function payout(address to, uint256 amount) external virtual override onlyOracle nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        if (totalLiquidity < amount) {
            revert InsufficientLiquidity();
        }
        
        totalLiquidity -= amount;
        totalPayouts += amount;
        stablecoin.safeTransfer(to, amount);
        
        emit Payout(to, amount);
    }
    
    function getPoolTVL() external view override returns (uint256) {
        return totalLiquidity;
    }
    
    function getAPY() external view returns (uint256) {
        if (totalLiquidity == 0) {
            return 0;
        }
        return (totalPremiums * 10000) / totalLiquidity;
    }
    
    // Get total number of unique LPs (ever deposited)
    function getTotalLPCount() external view returns (uint256) {
        return lpAddresses.length;
    }
    
    // Get number of active LPs (with balance > 0)
    function getActiveLPCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < lpAddresses.length; i++) {
            if (balances[lpAddresses[i]] > 0) {
                count++;
            }
        }
        return count;
    }
    
    // Get pool utilization (percentage of capital at risk)
    // Returns in basis points (10000 = 100%)
    function getUtilization() external view returns (uint256) {
        if (totalLiquidity == 0) {
            return 0;
        }
        // Capital at risk = premiums collected but not yet paid out or kept as profit
        uint256 capitalAtRisk = totalPremiums > totalPayouts ? totalPremiums - totalPayouts : 0;
        return (capitalAtRisk * 10000) / totalLiquidity;
    }
}


