// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Marketplace {
	struct Product {
		address payable seller;
		uint256 priceWei;
		string ipfsCid;
		bool exists;
		mapping(address => bool) hasAccess;
	}

	mapping(bytes32 => Product) private products;
	uint256 public platformFeeBps; // e.g., 2000 = 20%
	address payable public feeRecipient;

	event ProductListed(bytes32 indexed id, address indexed seller, uint256 priceWei, string ipfsCid);
	event ProductPurchased(bytes32 indexed id, address indexed buyer, uint256 priceWei, uint256 feeAmount);

	constructor(uint256 _platformFeeBps, address payable _feeRecipient) {
		require(_platformFeeBps <= 5000, "fee too high");
		require(_feeRecipient != address(0), "bad recipient");
		platformFeeBps = _platformFeeBps;
		feeRecipient = _feeRecipient;
	}

	function setPlatformParams(uint256 _platformFeeBps, address payable _feeRecipient) external {
		require(msg.sender == feeRecipient, "only recipient can update");
		require(_platformFeeBps <= 5000, "fee too high");
		require(_feeRecipient != address(0), "bad recipient");
		platformFeeBps = _platformFeeBps;
		feeRecipient = _feeRecipient;
	}

	function computeId(string memory ipfsCid) public pure returns (bytes32) {
		return keccak256(abi.encodePacked(ipfsCid));
	}

	function listProduct(string calldata ipfsCid, uint256 priceWei) external {
		require(priceWei > 0, "price=0");
		bytes32 id = computeId(ipfsCid);
		Product storage p = products[id];
		require(!p.exists, "already listed");
		p.seller = payable(msg.sender);
		p.priceWei = priceWei;
		p.ipfsCid = ipfsCid;
		p.exists = true;
		emit ProductListed(id, msg.sender, priceWei, ipfsCid);
	}

	function getProduct(string calldata ipfsCid) external view returns (address seller, uint256 priceWei, bool exists) {
		bytes32 id = computeId(ipfsCid);
		Product storage p = products[id];
		return (p.seller, p.priceWei, p.exists);
	}

	function hasBuyerAccess(address buyer, string calldata ipfsCid) external view returns (bool) {
		bytes32 id = computeId(ipfsCid);
		Product storage p = products[id];
		if (!p.exists) return false;
		return p.hasAccess[buyer] || buyer == p.seller;
	}

	function purchase(string calldata ipfsCid) external payable {
		bytes32 id = computeId(ipfsCid);
		Product storage p = products[id];
		require(p.exists, "not listed");
		require(msg.value == p.priceWei, "bad amount");
		require(!p.hasAccess[msg.sender], "already bought");

		uint256 feeAmount = (msg.value * platformFeeBps) / 10000;
		uint256 sellerAmount = msg.value - feeAmount;

		p.hasAccess[msg.sender] = true;

		if (feeAmount > 0) {
			(bool fOk, ) = feeRecipient.call{value: feeAmount}("");
			require(fOk, "fee xfer failed");
		}
		(bool sOk, ) = p.seller.call{value: sellerAmount}("");
		require(sOk, "seller xfer failed");

		emit ProductPurchased(id, msg.sender, msg.value, feeAmount);
	}
}


