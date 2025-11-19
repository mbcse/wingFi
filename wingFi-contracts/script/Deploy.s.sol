// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PolicyNFT} from "../src/PolicyNFT.sol";
import {GlobalPool} from "../src/GlobalPool.sol";
import {AirlinePool} from "../src/AirlinePool.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";
import {PoolManager} from "../src/PoolManager.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DeployScript is Script {
    struct Airline {
        string code;
        string name;
    }
    
    Airline[] public airlines;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        uint256 chainId = block.chainid;
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("\n========================================");
        console.log("AeroFi Complete Deployment Script");
        console.log("Chain ID:", chainId);
        console.log("========================================\n");
        console.log("Deployer:", deployer);
        console.log("\n--- Step 1: Deploying Core Contracts ---\n");
        
        MockERC20 stablecoin = new MockERC20("Mock USDC", "USDC");
        console.log("[OK] MockERC20 deployed at:", address(stablecoin));
        
        PolicyNFT policyNFT = new PolicyNFT();
        console.log("[OK] PolicyNFT deployed at:", address(policyNFT));
        
        GlobalPool globalPool = new GlobalPool(
            address(stablecoin),
            address(0)
        );
        console.log("[OK] GlobalPool deployed at:", address(globalPool));
        
        OracleAdapter oracleAdapter = new OracleAdapter(
            address(0),
            address(policyNFT)
        );
        console.log("[OK] OracleAdapter deployed at:", address(oracleAdapter));
        
        PoolManager poolManager = new PoolManager(
            address(stablecoin),
            address(globalPool),
            address(policyNFT),
            address(oracleAdapter)
        );
        console.log("[OK] PoolManager deployed at:", address(poolManager));
        
        console.log("\n--- Step 2: Configuring Core Contracts ---\n");
        
        globalPool.setOracleAdapter(address(oracleAdapter));
        console.log("[OK] GlobalPool oracle adapter set");
        
        policyNFT.setMinter(address(poolManager));
        console.log("[OK] PolicyNFT minter set to PoolManager");
        
        policyNFT.setOracleAdapter(address(oracleAdapter));
        console.log("[OK] PolicyNFT oracle adapter set");
        
        oracleAdapter.setPoolManager(address(poolManager));
        console.log("[OK] OracleAdapter pool manager set");
        
        console.log("\n--- Step 3: Deploying Airline Pools ---\n");
        
        _initializeAirlines();
        
        address[] memory airlinePoolAddresses = new address[](airlines.length);
        
        for (uint256 i = 0; i < airlines.length; i++) {
            AirlinePool airlinePool = new AirlinePool(
                address(stablecoin),
                address(oracleAdapter),
                airlines[i].code,
                address(globalPool)
            );
            
            airlinePoolAddresses[i] = address(airlinePool);
            
            console.log("[OK] Airline Pool deployed:", airlines[i].name);
            console.log("    Code:", airlines[i].code);
            console.log("    Address:", address(airlinePool));
        }
        
        console.log("\n--- Step 4: Authorizing Airline Pools ---\n");
        
        for (uint256 i = 0; i < airlinePoolAddresses.length; i++) {
            globalPool.authorizePool(airlinePoolAddresses[i]);
            console.log("[OK]", airlines[i].name, "authorized in GlobalPool");
        }
        
        console.log("\n--- Step 5: Registering Airlines in PoolManager ---\n");
        
        for (uint256 i = 0; i < airlines.length; i++) {
            poolManager.registerAirline(airlines[i].code, airlinePoolAddresses[i]);
            console.log("[OK]", airlines[i].name, "registered:", airlines[i].code);
        }
        
        console.log("\n========================================");
        console.log("DEPLOYMENT COMPLETE - READY TO USE!");
        console.log("========================================\n");
        
        console.log("=== Core Contracts ===");
        console.log("Stablecoin (USDC):", address(stablecoin));
        console.log("PolicyNFT:", address(policyNFT));
        console.log("GlobalPool:", address(globalPool));
        console.log("OracleAdapter:", address(oracleAdapter));
        console.log("PoolManager:", address(poolManager));
        
        console.log("\n=== Airline Pools ===");
        for (uint256 i = 0; i < airlines.length; i++) {
            console.log(airlines[i].name);
            console.log("  Code:", airlines[i].code);
            console.log("  Address:", airlinePoolAddresses[i]);
        }
        
        console.log("\n--- Step 6: Deployment Info for JSON Generation ---\n");
        console.log("Run the following command to generate deployment JSON:");
        console.log("CHAIN_ID=", chainId, " node script/generate-deployment-json.js");
        console.log("\nContract Addresses:");
        console.log("Stablecoin:", address(stablecoin));
        console.log("PolicyNFT:", address(policyNFT));
        console.log("GlobalPool:", address(globalPool));
        console.log("OracleAdapter:", address(oracleAdapter));
        console.log("PoolManager:", address(poolManager));
        for (uint256 i = 0; i < airlines.length; i++) {
            console.log(airlines[i].code, ":", airlinePoolAddresses[i]);
        }
        
        console.log("\n=== Next Steps ===");
        console.log("1. Fund GlobalPool with liquidity");
        console.log("2. Fund airline pools with liquidity (optional)");
        console.log("3. Users can now buy insurance via PoolManager");
        console.log("4. Oracle can submit flight status via OracleAdapter");
        console.log("\n");
        
        vm.stopBroadcast();
    }
    
    function _initializeAirlines() internal {
        airlines.push(Airline({code: "EK", name: "Emirates"}));
        airlines.push(Airline({code: "AI", name: "Air India"}));
        airlines.push(Airline({code: "QR", name: "Qatar Airways"}));
        airlines.push(Airline({code: "DL", name: "Delta Airlines"}));
        airlines.push(Airline({code: "LH", name: "Lufthansa"}));
        airlines.push(Airline({code: "LX", name: "Swiss Airlines"}));
        airlines.push(Airline({code: "TK", name: "Turkish Airlines"}));
        airlines.push(Airline({code: "6E", name: "Indigo"}));
        airlines.push(Airline({code: "AA", name: "American Airlines"}));
        airlines.push(Airline({code: "BA", name: "British Airways"}));
    }
}

