// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {PolicyNFT} from "../src/PolicyNFT.sol";
import {GlobalPool} from "../src/GlobalPool.sol";
import {AirlinePool} from "../src/AirlinePool.sol";
import {CrowdFillPool} from "../src/CrowdFillPool.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";
import {PoolManager} from "../src/PoolManager.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {IPool} from "../src/interfaces/IPool.sol";

contract WingFiTest is Test {
    MockERC20 public stablecoin;
    PolicyNFT public policyNFT;
    GlobalPool public globalPool;
    AirlinePool public airlinePool;
    OracleAdapter public oracleAdapter;
    PoolManager public poolManager;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public lp1 = address(4);
    address public lp2 = address(5);
    address public oracle = address(6);
    
    bytes32 public constant FLIGHT_ID_1 = keccak256("EK123-2024-01-15");
    bytes32 public constant FLIGHT_ID_2 = keccak256("AA456-2024-01-16");
    string public constant PNR_1 = "ABC123";
    string public constant PNR_2 = "XYZ789";
    string public constant AIRLINE_CODE = "EK";
    
    uint256 public constant COVERAGE_AMOUNT = 1000 * 10**18;
    uint256 public constant PREMIUM = 100 * 10**18;
    uint256 public constant LP_DEPOSIT = 10000 * 10**18;
    
    function setUp() public {
        vm.startPrank(owner);
        
        stablecoin = new MockERC20("Mock USDC", "USDC");
        policyNFT = new PolicyNFT();
        globalPool = new GlobalPool(address(stablecoin), address(0));
        oracleAdapter = new OracleAdapter(address(0), address(policyNFT));
        
        globalPool.setOracleAdapter(address(oracleAdapter));
        
        poolManager = new PoolManager(
            address(stablecoin),
            address(globalPool),
            address(policyNFT),
            address(oracleAdapter)
        );
        
        policyNFT.setMinter(address(poolManager));
        policyNFT.setOracleAdapter(address(oracleAdapter));
        oracleAdapter.setPoolManager(address(poolManager));
        
        airlinePool = new AirlinePool(
            address(stablecoin),
            address(oracleAdapter),
            AIRLINE_CODE,
            address(globalPool)
        );
        
        globalPool.authorizePool(address(airlinePool));
        poolManager.registerAirline(AIRLINE_CODE, address(airlinePool));
        
        stablecoin.mint(user1, 100000 * 10**18);
        stablecoin.mint(user2, 100000 * 10**18);
        stablecoin.mint(lp1, 100000 * 10**18);
        stablecoin.mint(lp2, 100000 * 10**18);
        
        vm.stopPrank();
    }
    
    function test_Deployment() public {
        assertEq(address(poolManager.globalPool()), address(globalPool));
        assertEq(address(poolManager.policyNFT()), address(policyNFT));
        assertEq(address(poolManager.oracleAdapter()), address(oracleAdapter));
        assertEq(poolManager.getAirlinePool(AIRLINE_CODE), address(airlinePool));
        assertEq(oracleAdapter.owner(), owner);
    }
    
    function test_GlobalPool_DepositAndWithdraw() public {
        vm.startPrank(lp1);
        stablecoin.approve(address(globalPool), LP_DEPOSIT);
        globalPool.deposit(LP_DEPOSIT);
        
        assertEq(globalPool.getLPBalance(lp1), LP_DEPOSIT);
        assertEq(globalPool.getPoolTVL(), LP_DEPOSIT);
        
        globalPool.withdraw(LP_DEPOSIT / 2);
        assertEq(globalPool.getLPBalance(lp1), LP_DEPOSIT / 2);
        assertEq(globalPool.getPoolTVL(), LP_DEPOSIT / 2);
        
        vm.stopPrank();
    }
    
    function test_BuyInsurance_GlobalPool() public {
        vm.startPrank(user1);
        stablecoin.approve(address(globalPool), PREMIUM);
        
        uint256 expiryTimestamp = block.timestamp + 7 days;
        
        uint256 tokenId = poolManager.buyInsuranceGlobal(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        
        assertEq(policyNFT.ownerOf(tokenId), user1);
        PolicyNFT.PolicyMetadata memory policy = policyNFT.getPolicy(tokenId);
        assertEq(policy.flightId, FLIGHT_ID_1);
        assertEq(policy.pnr, PNR_1);
        assertEq(policy.poolType, 0);
        assertEq(policy.coverageAmount, COVERAGE_AMOUNT);
        assertEq(policy.premiumPaid, PREMIUM);
        assertEq(globalPool.getPoolTVL(), PREMIUM);
        
        vm.stopPrank();
    }
    
    function test_BuyInsurance_AirlinePool() public {
        vm.startPrank(user1);
        stablecoin.approve(address(airlinePool), PREMIUM);
        
        uint256 expiryTimestamp = block.timestamp + 7 days;
        
        uint256 tokenId = poolManager.buyInsuranceAirline(
            user1,
            AIRLINE_CODE,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        
        assertEq(policyNFT.ownerOf(tokenId), user1);
        PolicyNFT.PolicyMetadata memory policy = policyNFT.getPolicy(tokenId);
        assertEq(policy.poolType, 1);
        assertEq(airlinePool.getPoolTVL(), PREMIUM);
        
        vm.stopPrank();
    }
    
    function test_BuyInsurance_CrowdFillPool() public {
        vm.startPrank(user1);
        
        uint256 expiryTimestamp = block.timestamp + 7 days;
        
        (uint256 tokenId, address crowdFillPoolAddress) = poolManager.buyInsuranceCrowdFill(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        
        assertEq(policyNFT.ownerOf(tokenId), user1);
        PolicyNFT.PolicyMetadata memory policy = policyNFT.getPolicy(tokenId);
        assertEq(policy.poolType, 2);
        
        CrowdFillPool crowdFillPool = CrowdFillPool(payable(crowdFillPoolAddress));
        assertEq(crowdFillPool.coverageRequired(), COVERAGE_AMOUNT);
        assertFalse(crowdFillPool.policyActive());
        
        vm.stopPrank();
    }
    
    function test_CrowdFillPool_Contribution() public {
        vm.startPrank(user1);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        (uint256 tokenId, address crowdFillPoolAddress) = poolManager.buyInsuranceCrowdFill(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        vm.stopPrank();
        
        CrowdFillPool crowdFillPool = CrowdFillPool(payable(crowdFillPoolAddress));
        
        vm.startPrank(lp1);
        stablecoin.approve(address(crowdFillPool), COVERAGE_AMOUNT / 2);
        crowdFillPool.deposit(COVERAGE_AMOUNT / 2);
        assertEq(crowdFillPool.currentFilled(), COVERAGE_AMOUNT / 2);
        assertFalse(crowdFillPool.policyActive());
        vm.stopPrank();
        
        vm.startPrank(lp2);
        stablecoin.approve(address(crowdFillPool), COVERAGE_AMOUNT / 2);
        crowdFillPool.deposit(COVERAGE_AMOUNT / 2);
        assertEq(crowdFillPool.currentFilled(), COVERAGE_AMOUNT);
        assertTrue(crowdFillPool.policyActive());
        vm.stopPrank();
    }
    
    function test_OracleAdapter_SubmitFlightStatus_Delayed() public {
        vm.startPrank(user1);
        stablecoin.approve(address(globalPool), PREMIUM);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        uint256 tokenId = poolManager.buyInsuranceGlobal(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        vm.stopPrank();
        
        vm.startPrank(lp1);
        stablecoin.approve(address(globalPool), LP_DEPOSIT);
        globalPool.deposit(LP_DEPOSIT);
        vm.stopPrank();
        
        uint256 balanceBefore = stablecoin.balanceOf(user1);
        
        vm.startPrank(owner);
        oracleAdapter.submitFlightStatusForPolicy(
            tokenId,
            OracleAdapter.FlightStatus.Delayed
        );
        vm.stopPrank();
        
        uint256 balanceAfter = stablecoin.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, COVERAGE_AMOUNT / 2);
    }
    
    function test_OracleAdapter_SubmitFlightStatus_Cancelled() public {
        vm.startPrank(user1);
        stablecoin.approve(address(globalPool), PREMIUM);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        uint256 tokenId = poolManager.buyInsuranceGlobal(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        vm.stopPrank();
        
        vm.startPrank(lp1);
        stablecoin.approve(address(globalPool), LP_DEPOSIT);
        globalPool.deposit(LP_DEPOSIT);
        vm.stopPrank();
        
        uint256 balanceBefore = stablecoin.balanceOf(user1);
        
        vm.startPrank(owner);
        oracleAdapter.submitFlightStatusForPolicy(
            tokenId,
            OracleAdapter.FlightStatus.Cancelled
        );
        vm.stopPrank();
        
        uint256 balanceAfter = stablecoin.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, COVERAGE_AMOUNT);
    }
    
    function test_AirlinePool_FallbackToGlobalPool() public {
        vm.startPrank(user1);
        stablecoin.approve(address(airlinePool), PREMIUM);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        uint256 tokenId = poolManager.buyInsuranceAirline(
            user1,
            AIRLINE_CODE,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        vm.stopPrank();
        
        vm.startPrank(lp1);
        stablecoin.approve(address(globalPool), LP_DEPOSIT * 3);
        globalPool.deposit(LP_DEPOSIT * 3);
        vm.stopPrank();
        
        uint256 balanceBefore = stablecoin.balanceOf(user1);
        uint256 globalPoolTVLBefore = globalPool.getPoolTVL();
        uint256 airlinePoolTVLBefore = airlinePool.getPoolTVL();
        
        vm.startPrank(owner);
        oracleAdapter.submitFlightStatusForPolicy(
            tokenId,
            OracleAdapter.FlightStatus.Cancelled
        );
        vm.stopPrank();
        
        uint256 balanceAfter = stablecoin.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, COVERAGE_AMOUNT);
        assertEq(airlinePool.getPoolTVL(), 0);
        assertEq(globalPool.getPoolTVL(), globalPoolTVLBefore - (COVERAGE_AMOUNT - airlinePoolTVLBefore));
    }
    
    function test_PNR_Uniqueness() public {
        vm.startPrank(user1);
        stablecoin.approve(address(globalPool), PREMIUM * 2);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        
        poolManager.buyInsuranceGlobal(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        
        vm.expectRevert(abi.encodeWithSelector(PolicyNFT.PNRAlreadyUsed.selector, PNR_1));
        poolManager.buyInsuranceGlobal(
            user1,
            FLIGHT_ID_2,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        
        vm.stopPrank();
    }
    
    function test_PolicyNFT_Soulbound() public {
        vm.startPrank(user1);
        stablecoin.approve(address(globalPool), PREMIUM);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        uint256 tokenId = poolManager.buyInsuranceGlobal(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        
        vm.expectRevert(PolicyNFT.TransferDisabled.selector);
        policyNFT.transferFrom(user1, user2, tokenId);
        
        vm.stopPrank();
    }
    
    function test_CrowdFillPool_PremiumDistribution() public {
        vm.startPrank(user1);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        (uint256 tokenId, address crowdFillPoolAddress) = poolManager.buyInsuranceCrowdFill(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        vm.stopPrank();
        
        CrowdFillPool crowdFillPool = CrowdFillPool(payable(crowdFillPoolAddress));
        
        uint256 lp1BalanceBefore = stablecoin.balanceOf(lp1);
        
        vm.startPrank(lp1);
        stablecoin.approve(address(crowdFillPool), COVERAGE_AMOUNT);
        crowdFillPool.deposit(COVERAGE_AMOUNT);
        vm.stopPrank();
        
        assertTrue(crowdFillPool.policyActive());
        uint256 lp1BalanceAfter = stablecoin.balanceOf(lp1);
        assertEq(lp1BalanceAfter, lp1BalanceBefore - COVERAGE_AMOUNT + PREMIUM);
    }
    
    function test_CrowdFillPool_Refund() public {
        vm.startPrank(user1);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        (uint256 tokenId, address crowdFillPoolAddress) = poolManager.buyInsuranceCrowdFill(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        vm.stopPrank();
        
        CrowdFillPool crowdFillPool = CrowdFillPool(payable(crowdFillPoolAddress));
        
        vm.startPrank(lp1);
        stablecoin.approve(address(crowdFillPool), COVERAGE_AMOUNT / 2);
        crowdFillPool.deposit(COVERAGE_AMOUNT / 2);
        vm.stopPrank();
        
        vm.warp(expiryTimestamp + 1);
        
        vm.startPrank(owner);
        crowdFillPool.refundContributors();
        vm.stopPrank();
        
        assertEq(stablecoin.balanceOf(lp1), 100000 * 10**18);
    }
    
    function test_EndToEnd_Flow() public {
        vm.startPrank(lp1);
        stablecoin.approve(address(globalPool), LP_DEPOSIT);
        globalPool.deposit(LP_DEPOSIT);
        vm.stopPrank();
        
        vm.startPrank(user1);
        stablecoin.approve(address(globalPool), PREMIUM);
        uint256 expiryTimestamp = block.timestamp + 7 days;
        uint256 tokenId = poolManager.buyInsuranceGlobal(
            user1,
            FLIGHT_ID_1,
            PNR_1,
            COVERAGE_AMOUNT,
            PREMIUM,
            expiryTimestamp
        );
        vm.stopPrank();
        
        assertEq(globalPool.getPoolTVL(), LP_DEPOSIT + PREMIUM);
        
        uint256 userBalanceBefore = stablecoin.balanceOf(user1);
        
        vm.startPrank(owner);
        oracleAdapter.submitFlightStatusForPolicy(
            tokenId,
            OracleAdapter.FlightStatus.Cancelled
        );
        vm.stopPrank();
        
        uint256 userBalanceAfter = stablecoin.balanceOf(user1);
        assertEq(userBalanceAfter - userBalanceBefore, COVERAGE_AMOUNT);
        
        PolicyNFT.PolicyMetadata memory policy = policyNFT.getPolicy(tokenId);
        assertTrue(policy.payoutExecuted);
    }
}

