// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PolicyNFT is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    address public minter;
    address public oracleAdapter;
    
    struct PolicyMetadata {
        bytes32 flightId;
        string pnr;
        uint8 poolType;
        uint256 coverageAmount;
        uint256 premiumPaid;
        uint256 expiryTimestamp;
        address poolAddress;
        bool payoutExecuted;
    }
    
    mapping(uint256 => PolicyMetadata) public policies;
    mapping(string => bool) public pnrUsed;
    mapping(bytes32 => uint256[]) public flightPolicies;
    
    event PolicyMinted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed flightId,
        string pnr,
        uint8 poolType,
        uint256 coverageAmount
    );
    
    event PayoutExecuted(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);
    
    error PNRAlreadyUsed(string pnr);
    error PolicyNotFound(uint256 tokenId);
    error PayoutAlreadyExecuted(uint256 tokenId);
    error PolicyExpired(uint256 tokenId);
    error TransferDisabled();
    error UnauthorizedMinter();
    
    modifier onlyMinter() {
        if (msg.sender != minter) {
            revert UnauthorizedMinter();
        }
        _;
    }
    
    constructor() ERC721("WingFi Policy", "WFP") Ownable(msg.sender) {}
    
    function setMinter(address _minter) external onlyOwner {
        address oldMinter = minter;
        minter = _minter;
        emit MinterUpdated(oldMinter, _minter);
    }
    
    function setOracleAdapter(address _oracleAdapter) external onlyOwner {
        oracleAdapter = _oracleAdapter;
    }
    
    function mintPolicy(
        address to,
        bytes32 flightId,
        string memory pnr,
        uint8 poolType,
        uint256 coverageAmount,
        uint256 premiumPaid,
        uint256 expiryTimestamp,
        address poolAddress
    ) external onlyMinter nonReentrant returns (uint256) {
        if (pnrUsed[pnr]) {
            revert PNRAlreadyUsed(pnr);
        }
        
        pnrUsed[pnr] = true;
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _mint(to, tokenId);
        
        policies[tokenId] = PolicyMetadata({
            flightId: flightId,
            pnr: pnr,
            poolType: poolType,
            coverageAmount: coverageAmount,
            premiumPaid: premiumPaid,
            expiryTimestamp: expiryTimestamp,
            poolAddress: poolAddress,
            payoutExecuted: false
        });
        
        flightPolicies[flightId].push(tokenId);
        
        emit PolicyMinted(tokenId, to, flightId, pnr, poolType, coverageAmount);
        
        return tokenId;
    }
    
    function markPayoutExecuted(uint256 tokenId) external {
        if (msg.sender != minter && msg.sender != owner() && msg.sender != oracleAdapter) {
            revert UnauthorizedMinter();
        }
        if (policies[tokenId].expiryTimestamp == 0) {
            revert PolicyNotFound(tokenId);
        }
        
        if (policies[tokenId].payoutExecuted) {
            revert PayoutAlreadyExecuted(tokenId);
        }
        
        policies[tokenId].payoutExecuted = true;
        emit PayoutExecuted(tokenId, ownerOf(tokenId), policies[tokenId].coverageAmount);
    }
    
    function getPolicy(uint256 tokenId) external view returns (PolicyMetadata memory) {
        if (policies[tokenId].expiryTimestamp == 0) {
            revert PolicyNotFound(tokenId);
        }
        return policies[tokenId];
    }
    
    function getFlightPolicies(bytes32 flightId) external view returns (uint256[] memory) {
        return flightPolicies[flightId];
    }
    
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        // Iterate through all minted tokens to find ones owned by this address
        for (uint256 i = 1; i <= _tokenIdCounter && index < tokenCount; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            revert TransferDisabled();
        }
        return from;
    }
}

