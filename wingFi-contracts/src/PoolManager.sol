// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GlobalPool.sol";
import "./AirlinePool.sol";
import "./CrowdFillPool.sol";
import "./PolicyNFT.sol";
import "./interfaces/IPool.sol";

contract PoolManager is Ownable, ReentrancyGuard {
    address public globalPool;
    address public policyNFT;
    address public oracleAdapter;
    address public immutable stablecoin;
    
    mapping(string => address) public airlinePools;
    mapping(address => bool) public registeredPools;
    string[] public registeredAirlines;
    
    event AirlineRegistered(string indexed airlineCode, address indexed poolAddress);
    event CrowdFillPoolCreated(address indexed poolAddress, bytes32 indexed flightId, uint256 indexed policyId);
    event PoolRegistered(address indexed poolAddress, uint8 poolType);
    
    error AirlineAlreadyRegistered(string airlineCode);
    error InvalidAddress();
    error PoolNotRegistered();
    error GlobalPoolNotSet();
    error PolicyNFTNotSet();
    error OracleAdapterNotSet();
    
    constructor(
        address _stablecoin,
        address _globalPool,
        address _policyNFT,
        address _oracleAdapter
    ) Ownable(msg.sender) {
        if (_stablecoin == address(0) || _globalPool == address(0) || 
            _policyNFT == address(0) || _oracleAdapter == address(0)) {
            revert InvalidAddress();
        }
        
        stablecoin = _stablecoin;
        globalPool = _globalPool;
        policyNFT = _policyNFT;
        oracleAdapter = _oracleAdapter;
        
        registeredPools[_globalPool] = true;
    }
    
    function setGlobalPool(address _globalPool) external onlyOwner {
        if (_globalPool == address(0)) {
            revert InvalidAddress();
        }
        globalPool = _globalPool;
        registeredPools[_globalPool] = true;
    }
    
    function setPolicyNFT(address _policyNFT) external onlyOwner {
        if (_policyNFT == address(0)) {
            revert InvalidAddress();
        }
        policyNFT = _policyNFT;
    }
    
    function setOracleAdapter(address _oracleAdapter) external onlyOwner {
        if (_oracleAdapter == address(0)) {
            revert InvalidAddress();
        }
        oracleAdapter = _oracleAdapter;
    }
    
    function registerAirline(string memory airlineCode, address poolAddress) external onlyOwner {
        if (poolAddress == address(0)) {
            revert InvalidAddress();
        }
        
        if (airlinePools[airlineCode] != address(0)) {
            revert AirlineAlreadyRegistered(airlineCode);
        }
        
        airlinePools[airlineCode] = poolAddress;
        registeredPools[poolAddress] = true;
        registeredAirlines.push(airlineCode);
        
        emit AirlineRegistered(airlineCode, poolAddress);
    }
    
    function createCrowdFillPool(
        address policyOwner,
        uint256 coverageRequired,
        uint256 premium,
        bytes32 flightId,
        uint256 policyId
    ) public returns (address) {
        if (oracleAdapter == address(0)) {
            revert OracleAdapterNotSet();
        }
        
        CrowdFillPool newPool = new CrowdFillPool(
            stablecoin,
            oracleAdapter,
            policyOwner,
            coverageRequired,
            premium,
            flightId,
            policyId
        );
        
        address poolAddress = address(newPool);
        registeredPools[poolAddress] = true;
        
        emit CrowdFillPoolCreated(poolAddress, flightId, policyId);
        
        return poolAddress;
    }
    
    function getAirlinePool(string memory airlineCode) external view returns (address) {
        return airlinePools[airlineCode];
    }
    
    function getRegisteredAirlines() external view returns (string[] memory) {
        return registeredAirlines;
    }
    
    function isPoolRegistered(address poolAddress) external view returns (bool) {
        return registeredPools[poolAddress];
    }
    
    function buyInsuranceGlobal(
        address user,
        bytes32 flightId,
        string memory pnr,
        uint256 coverageAmount,
        uint256 premium,
        uint256 expiryTimestamp
    ) external returns (uint256) {
        if (globalPool == address(0)) {
            revert GlobalPoolNotSet();
        }
        if (policyNFT == address(0)) {
            revert PolicyNFTNotSet();
        }
        
        IPool(globalPool).collectPremium(user, premium);
        
        uint256 tokenId = PolicyNFT(policyNFT).mintPolicy(
            user,
            flightId,
            pnr,
            0,
            coverageAmount,
            premium,
            expiryTimestamp,
            globalPool
        );
        
        return tokenId;
    }
    
    function buyInsuranceAirline(
        address user,
        string memory airlineCode,
        bytes32 flightId,
        string memory pnr,
        uint256 coverageAmount,
        uint256 premium,
        uint256 expiryTimestamp
    ) external returns (uint256) {
        address airlinePoolAddress = airlinePools[airlineCode];
        if (airlinePoolAddress == address(0)) {
            revert PoolNotRegistered();
        }
        if (policyNFT == address(0)) {
            revert PolicyNFTNotSet();
        }
        
        IPool(airlinePoolAddress).collectPremium(user, premium);
        
        uint256 tokenId = PolicyNFT(policyNFT).mintPolicy(
            user,
            flightId,
            pnr,
            1,
            coverageAmount,
            premium,
            expiryTimestamp,
            airlinePoolAddress
        );
        
        return tokenId;
    }
    
    function buyInsuranceCrowdFill(
        address user,
        bytes32 flightId,
        string memory pnr,
        uint256 coverageAmount,
        uint256 premium,
        uint256 expiryTimestamp
    ) external returns (uint256, address) {
        if (policyNFT == address(0)) {
            revert PolicyNFTNotSet();
        }
        
        address crowdFillPool = createCrowdFillPool(
            user,
            coverageAmount,
            premium,
            flightId,
            0
        );
        
        uint256 tokenId = PolicyNFT(policyNFT).mintPolicy(
            user,
            flightId,
            pnr,
            2,
            coverageAmount,
            premium,
            expiryTimestamp,
            crowdFillPool
        );
        
        return (tokenId, crowdFillPool);
    }
}

