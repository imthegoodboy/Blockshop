export default function HowPage() {
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-semibold">How it works</h1>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Seller uploads a file to IPFS (Lighthouse) and sets a price.</li>
                <li>Listing is created on the Polygon Amoy marketplace smart contract.</li>
                <li>Buyer connects wallet and purchases; contract enforces platform fee.</li>
                <li>After purchase, buyer signs a request and downloads via the site.</li>
            </ol>
        </div>
    );
}




