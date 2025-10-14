export const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "";

export const marketplaceAbi = [
	{
		"inputs": [
			{ "internalType": "uint256", "name": "_platformFeeBps", "type": "uint256" },
			{ "internalType": "address payable", "name": "_feeRecipient", "type": "address" }
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{ "inputs": [], "name": "platformFeeBps", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "feeRecipient", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [{ "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "computeId", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "pure", "type": "function" },
	{ "inputs": [{ "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "getProduct", "outputs": [
		{ "internalType": "address", "name": "seller", "type": "address" },
		{ "internalType": "uint256", "name": "priceWei", "type": "uint256" },
		{ "internalType": "bool", "name": "exists", "type": "bool" }
	], "stateMutability": "view", "type": "function" },
	{ "inputs": [{ "internalType": "string", "name": "ipfsCid", "type": "string" }, { "internalType": "uint256", "name": "priceWei", "type": "uint256" }], "name": "listProduct", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "hasBuyerAccess", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [{ "internalType": "string", "name": "ipfsCid", "type": "string" }], "name": "purchase", "outputs": [], "stateMutability": "payable", "type": "function" }
];


