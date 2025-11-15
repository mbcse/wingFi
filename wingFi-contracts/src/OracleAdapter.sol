// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PolicyNFT.sol";
import "./interfaces/IPool.sol";
import "./PoolManager.sol";

contract OracleAdapter is Ownable, ReentrancyGuard {
    enum FlightStatus {
        OnTime,
        Delayed,
        Cancelled
    }
    
    address public poolManager;
    address public policyNFT;
    
    mapping(bytes32 => FlightStatus) public flightStatuses;
    mapping(uint256 => bool) public payoutExecuted;
    
    event FlightStatusSubmitted(
        bytes32 indexed flightId,
        FlightStatus status,
        uint256 timestamp
    );
    
    event PayoutExecuted(
        uint256 indexed policyId,
        address indexed recipient,
        uint256 amount,
        FlightStatus status
    );
    
    error PolicyNFTNotSet();
    error PoolManagerNotSet();
    error PolicyNotFound(uint256 policyId);
    error PayoutAlreadyExecuted(uint256 policyId);
    error PolicyExpired(uint256 policyId);
    error InvalidStatus();
    error InsufficientPoolFunds();
    
    constructor(address _poolManager, address _policyNFT) Ownable(msg.sender) {
        poolManager = _poolManager;
        policyNFT = _policyNFT;
    }
    
    function setPoolManager(address _poolManager) external onlyOwner {
        poolManager = _poolManager;
    }
    
    function setPolicyNFT(address _policyNFT) external onlyOwner {
        policyNFT = _policyNFT;
    }
    
    function submitFlightStatus(
        bytes32 flightId,
        FlightStatus status
    ) external onlyOwner {
        if (uint8(status) > 2) {
            revert InvalidStatus();
        }
        
        flightStatuses[flightId] = status;
        
        emit FlightStatusSubmitted(flightId, status, block.timestamp);
        
        if (status == FlightStatus.Delayed || status == FlightStatus.Cancelled) {
            _processFlightPayouts(flightId, status);
        }
    }
    
    function submitFlightStatusForPolicy(
        uint256 policyId,
        FlightStatus status
    ) external onlyOwner nonReentrant {
        if (policyNFT == address(0)) {
            revert PolicyNFTNotSet();
        }
        
        if (uint8(status) > 2) {
            revert InvalidStatus();
        }
        
        PolicyNFT.PolicyMetadata memory policy = PolicyNFT(policyNFT).getPolicy(policyId);
        
        if (policy.expiryTimestamp == 0) {
            revert PolicyNotFound(policyId);
        }
        
        if (payoutExecuted[policyId]) {
            revert PayoutAlreadyExecuted(policyId);
        }
        
        if (block.timestamp > policy.expiryTimestamp) {
            revert PolicyExpired(policyId);
        }
        
        flightStatuses[policy.flightId] = status;
        
        emit FlightStatusSubmitted(policy.flightId, status, block.timestamp);
        
        if (status == FlightStatus.Delayed || status == FlightStatus.Cancelled) {
            _executePayout(policyId, policy, status);
        }
    }
    
    function _processFlightPayouts(bytes32 flightId, FlightStatus status) internal {
        if (policyNFT == address(0)) {
            return;
        }
        
        uint256[] memory policies = PolicyNFT(policyNFT).getFlightPolicies(flightId);
        
        for (uint256 i = 0; i < policies.length; i++) {
            uint256 policyId = policies[i];
            
            if (payoutExecuted[policyId]) {
                continue;
            }
            
            PolicyNFT.PolicyMetadata memory policy = PolicyNFT(policyNFT).getPolicy(policyId);
            
            if (block.timestamp > policy.expiryTimestamp) {
                continue;
            }
            
            _executePayout(policyId, policy, status);
        }
    }
    
    function _executePayout(
        uint256 policyId,
        PolicyNFT.PolicyMetadata memory policy,
        FlightStatus status
    ) internal {
        if (payoutExecuted[policyId]) {
            return;
        }
        
        payoutExecuted[policyId] = true;
        
        address recipient = PolicyNFT(policyNFT).ownerOf(policyId);
        uint256 payoutAmount = policy.coverageAmount;
        
        if (status == FlightStatus.Delayed) {
            payoutAmount = (payoutAmount * 50) / 100;
        }
        
        try IPool(policy.poolAddress).payout(recipient, payoutAmount) {
            PolicyNFT(policyNFT).markPayoutExecuted(policyId);
            
            emit PayoutExecuted(policyId, recipient, payoutAmount, status);
        } catch {
            revert InsufficientPoolFunds();
        }
    }
    
    function getFlightStatus(bytes32 flightId) external view returns (FlightStatus) {
        return flightStatuses[flightId];
    }
    
    function hasPayoutExecuted(uint256 policyId) external view returns (bool) {
        return payoutExecuted[policyId];
    }
}

