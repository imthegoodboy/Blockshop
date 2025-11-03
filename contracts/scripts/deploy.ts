import { ethers } from "hardhat";

async function main() {
	const platformFeeBps = Number(process.env.PLATFORM_FEE_BPS || 2000);
	const feeRecipient = process.env.FEE_RECIPIENT as string;
	if (!feeRecipient) {
		throw new Error("FEE_RECIPIENT not set");
	}
	const Marketplace = await ethers.getContractFactory("Marketplace");
	const marketplace = await Marketplace.deploy(platformFeeBps, feeRecipient);
	await marketplace.waitForDeployment();
	console.log("Marketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});


