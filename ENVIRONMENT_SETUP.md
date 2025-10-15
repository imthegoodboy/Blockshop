# Environment Variables for Blockshop

## Required Environment Variables

### Database Configuration

- `MONGODB_URI`: Your MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/`
- `MONGODB_DB`: Database name (default: blockshopy)

### Authentication

- `JWT_SECRET`: Secret key for JWT token signing
  - Generate a secure random string for production

### Blockchain Configuration

- `NEXT_PUBLIC_MARKETPLACE_ADDRESS`: Your deployed smart contract address
  - Example: `0x1234567890abcdef...`

### Optional

- `LIGHTHOUSE_API_KEY`: For IPFS file storage (if using Lighthouse)

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Make sure to set them for Production, Preview, and Development environments
