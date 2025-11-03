import { expect } from "chai";
import { ethers } from "hardhat";

describe("Marketplace", function () {
  it("should list a product and split payment with 20% fee", async function () {
    const [deployer, seller, buyer] = await ethers.getSigners();

    const platformFeeBps = 2000; // 20%
    const feeRecipient = deployer.address;

    const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(platformFeeBps, feeRecipient);
  await marketplace.waitForDeployment();

    const cid = "QmTestCid123";
    const price = ethers.parseEther("1.0");

    // seller lists product
    await marketplace.connect(seller).listProduct(cid, price);

    // check product details
    const product = await marketplace.getProduct(cid);
    expect(product.seller).to.equal(seller.address);
    expect(product.priceWei).to.equal(price);
    expect(product.exists).to.equal(true);

    // record balances before purchase
    const sellerBefore = await ethers.provider.getBalance(seller.address);
    const feeBefore = await ethers.provider.getBalance(feeRecipient);

    // buyer purchases
    const tx = await marketplace.connect(buyer).purchase(cid, { value: price });
    await tx.wait();

    // compute expected amounts
    const feeAmount = price * BigInt(platformFeeBps) / BigInt(10000);
    const sellerAmount = price - feeAmount;

    // check balances after
    const sellerAfter = await ethers.provider.getBalance(seller.address);
    const feeAfter = await ethers.provider.getBalance(feeRecipient);

    expect(sellerAfter - sellerBefore).to.equal(sellerAmount);
    expect(feeAfter - feeBefore).to.equal(feeAmount);

    // buyer should have access
    const has = await marketplace.hasBuyerAccess(buyer.address, cid);
    expect(has).to.equal(true);
  });
});
