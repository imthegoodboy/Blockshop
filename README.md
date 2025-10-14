## BlockShop — a simple decentralized digital marketplace

BlockShop is a user-friendly, decentralized marketplace for digital goods (images, PDFs, music, e-books, and other files). It combines a modern web storefront with blockchain-backed ownership and IPFS file storage so creators can sell digital items directly to buyers with minimal friction.

This repository contains the frontend (Next.js), smart contract code (Hardhat + Solidity), and helper scripts used during development and deployment.

Why this matters for everyday people
- You keep control: files are stored on IPFS and sales are recorded on-chain — no single company can take down your purchases.
- Simple buying experience: connect a wallet, pay, and get immediate access to your file.
- Fair payouts for creators: the marketplace automatically distributes payments (configurable fee split), no middleman required.

How the website works (high level)
1. Sellers upload a file using the web UI. The file is stored on IPFS (via a storage provider) and the UI stores metadata off-chain for browsing.
2. To list a product, the seller creates an on-chain listing in the Marketplace contract, which records the product's CID and price.
3. A buyer connects a web3 wallet (e.g., MetaMask or WalletConnect) and purchases a product with MATIC (this project targets Polygon Amoy testnet in development).
4. The smart contract records the purchase and distributes funds automatically (platform fee + seller payout).
5. The UI verifies purchase ownership and allows the buyer to download the file from IPFS (download access is gated by on-chain purchase records and optional server-side checks).

Security and privacy (what we do and what you should know)
- Decentralized storage: files use IPFS CIDs — the project does not rely on a single centralized storage provider for file availability.
- Minimal server exposure: upload endpoints should be implemented server-side so API keys are never exposed in the browser. The repo includes secure upload proxy patterns in the Next.js API routes.
- On-chain access control: purchases are recorded on-chain; the UI checks ownership before revealing download links.
- Signature-based downloads: for extra safety, downloads can be authorized with wallet signatures so only the buyer who purchased a CID can request the file.
- Important note: this is an open-source project used for learning and testnets — for production deployments you should audit contracts, secure environment variables, and run penetration tests.

Quick start (developer)
1. Requirements
  - Node.js 18+ and npm/yarn/pnpm
  - A Polygon Amoy testnet wallet (for local testing)

2. Smart contracts (locally)
  - cd contracts
  - Create a `.env` with keys: AMOY_RPC_URL, PRIVATE_KEY, POLYGONSCAN_API_KEY (optional), FEE_RECIPIENT, PLATFORM_FEE_BPS
  - npm install
  - npm run build
  - npm run deploy:amoy

3. Web app (locally)
  - cd web
  - Create a `.env` with: NEXT_PUBLIC_WALLETCONNECT_ID, NEXT_PUBLIC_MARKETPLACE_ADDRESS (deployed address), WEB3_STORAGE_TOKEN, GEMINI_API_KEY (optional)
  - npm install
  - npm run dev
  - Open http://localhost:3000

How to use the site (for normal users)
- Explore: browse available products and preview product information.
- Buy: connect a wallet, click buy, approve the transaction, and the marketplace transfers the file access to you.
- Sell: upload your file, set a price, and publish the listing. The contract handles payments and fee splits automatically.

Where to look in this repo
- `web/` — Next.js frontend and API routes
- `contracts/` — Solidity smart contract and deployment scripts
- `scripts/` — deployment and helper scripts

Notes & next steps for production
- Audit contracts before any real-money deployment.
- Use a secure storage provider and ensure server-side upload endpoints keep keys secret.
- Consider adding end-to-end tests for purchase and download flows and automated contract verification on the desired network.

Contributing
If you'd like to help, open an issue or a pull request. Please follow the repository code style and add tests for new features.

License
This project is open-source — include your preferred license here  .

Thank you for checking out BlockShop — a simple way to buy and sell digital goods in a more open, user-controlled way.
