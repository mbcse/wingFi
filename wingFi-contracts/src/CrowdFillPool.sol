// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPool.sol";

contract CrowdFillPool is IPool, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    struct Contributor {
        address lp;
        uint256 amount;
        uint256 premiumShare;
    }
    
    IERC20 public immutable stablecoin;
    address public oracleAdapter;
    address public policyOwner;
    
    Contributor[] public contributors;
    uint256 public currentFilled;
    uint256 public coverageRequired;
    uint256 public premium;
    bool public policyActive;
    bool public payoutExecuted;
    bytes32 public flightId;
    uint256 public policyId;
    
    event CrowdFillContribution(address indexed contributor, uint256 amount);
    event CrowdFillActivated(uint256 coverageRequired, uint256 premium);
    event PremiumDistributed(address indexed contributor, uint256 amount);
    event Withdraw(address indexed lp, uint256 amount);
    event Payout(address indexed user, uint256 amount);
    event RefundIssued(address indexed contributor, uint256 amount);
    
    error InvalidAmount();
    error PolicyAlreadyActive();
    error PolicyNotActive();
    error ExceedsCoverageRequired();
    error InsufficientFunds();
    error PayoutAlreadyExecuted();
    error UnauthorizedOracle();
    error PolicyNotFullyFunded();
    
    modifier onlyOracle() {
        if (msg.sender != oracleAdapter) {
            revert UnauthorizedOracle();
        }
        _;
    }
    
    constructor(
        address _stablecoin,
        address _oracleAdapter,
        address _policyOwner,
        uint256 _coverageRequired,
        uint256 _premium,
        bytes32 _flightId,
        uint256 _policyId
    ) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        oracleAdapter = _oracleAdapter;
        policyOwner = _policyOwner;
        coverageRequired = _coverageRequired;
        premium = _premium;
        flightId = _flightId;
        policyId = _policyId;
    }
    
    function setOracleAdapter(address _oracleAdapter) external onlyOwner {
        oracleAdapter = _oracleAdapter;
    }
    
    function deposit(uint256 amount) external override nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        if (policyActive) {
            revert PolicyAlreadyActive();
        }
        
        if (currentFilled + amount > coverageRequired) {
            revert ExceedsCoverageRequired();
        }
        
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        
        uint256 contributorIndex = contributors.length;
        bool found = false;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            if (contributors[i].lp == msg.sender) {
                contributorIndex = i;
                found = true;
                break;
            }
        }
        
        if (found) {
            contributors[contributorIndex].amount += amount;
        } else {
            contributors.push(Contributor({
                lp: msg.sender,
                amount: amount,
                premiumShare: 0
            }));
        }
        
        currentFilled += amount;
        
        emit CrowdFillContribution(msg.sender, amount);
        
        if (currentFilled == coverageRequired) {
            _activatePolicy();
        }
    }
    
    function _activatePolicy() internal {
        policyActive = true;
        
        if (premium > 0 && contributors.length > 0) {
            for (uint256 i = 0; i < contributors.length; i++) {
                uint256 share = (contributors[i].amount * premium) / coverageRequired;
                contributors[i].premiumShare = share;
                
                if (share > 0) {
                    stablecoin.safeTransfer(contributors[i].lp, share);
                    emit PremiumDistributed(contributors[i].lp, share);
                }
            }
        }
        
        emit CrowdFillActivated(coverageRequired, premium);
    }
    
    function withdraw(uint256 amount) external override nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        if (policyActive) {
            revert PolicyAlreadyActive();
        }
        
        uint256 contributorIndex = contributors.length;
        bool found = false;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            if (contributors[i].lp == msg.sender) {
                contributorIndex = i;
                found = true;
                break;
            }
        }
        
        if (!found || contributors[contributorIndex].amount < amount) {
            revert InsufficientFunds();
        }
        
        contributors[contributorIndex].amount -= amount;
        currentFilled -= amount;
        
        if (contributors[contributorIndex].amount == 0) {
            for (uint256 i = contributorIndex; i < contributors.length - 1; i++) {
                contributors[i] = contributors[i + 1];
            }
            contributors.pop();
        }
        
        stablecoin.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }
    
    function getLPBalance(address user) external view override returns (uint256) {
        for (uint256 i = 0; i < contributors.length; i++) {
            if (contributors[i].lp == user) {
                return contributors[i].amount;
            }
        }
        return 0;
    }
    
    function collectPremium(address from, uint256 amount) external override nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        if (!policyActive) {
            revert PolicyNotActive();
        }
        
        stablecoin.safeTransferFrom(from, address(this), amount);
        premium += amount;
        
        if (contributors.length > 0) {
            for (uint256 i = 0; i < contributors.length; i++) {
                uint256 share = (contributors[i].amount * amount) / coverageRequired;
                contributors[i].premiumShare += share;
                
                if (share > 0) {
                    stablecoin.safeTransfer(contributors[i].lp, share);
                    emit PremiumDistributed(contributors[i].lp, share);
                }
            }
        }
    }
    
    function payout(address to, uint256 amount) external override onlyOracle nonReentrant {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        if (!policyActive) {
            revert PolicyNotActive();
        }
        
        if (payoutExecuted) {
            revert PayoutAlreadyExecuted();
        }
        
        if (currentFilled < amount) {
            revert InsufficientFunds();
        }
        
        payoutExecuted = true;
        
        uint256 remainingAmount = amount;
        
        for (uint256 i = 0; i < contributors.length && remainingAmount > 0; i++) {
            uint256 contributorShare = (contributors[i].amount * amount) / coverageRequired;
            
            if (contributorShare > contributors[i].amount) {
                contributorShare = contributors[i].amount;
            }
            
            if (contributorShare > remainingAmount) {
                contributorShare = remainingAmount;
            }
            
            contributors[i].amount -= contributorShare;
            currentFilled -= contributorShare;
            remainingAmount -= contributorShare;
        }
        
        stablecoin.safeTransfer(to, amount);
        emit Payout(to, amount);
    }
    
    function refundContributors() external nonReentrant {
        if (policyActive && !payoutExecuted) {
            revert PolicyNotActive();
        }
        
        for (uint256 i = 0; i < contributors.length; i++) {
            if (contributors[i].amount > 0) {
                uint256 refundAmount = contributors[i].amount;
                contributors[i].amount = 0;
                stablecoin.safeTransfer(contributors[i].lp, refundAmount);
                emit RefundIssued(contributors[i].lp, refundAmount);
            }
        }
        
        currentFilled = 0;
    }
    
    function getPoolTVL() external view override returns (uint256) {
        return currentFilled;
    }
    
    function getContributorCount() external view returns (uint256) {
        return contributors.length;
    }
    
    function isFullyFunded() external view returns (bool) {
        return currentFilled >= coverageRequired;
    }
}

