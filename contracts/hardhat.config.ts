import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.24",
		settings: {
			optimizer: { enabled: true, runs: 200 }
		}
	},
	networks: {
		amoy: {
			url: AMOY_RPC_URL,
			accounts: [PRIVATE_KEY]
		}
	},
	etherscan: {
		apiKey: {
			polygonAmoy: process.env.POLYGONSCAN_API_KEY || ""
		}
	}
};

export default config;


