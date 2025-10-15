"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button, Card, Badge } from "@/components/ui";
import { MARKETPLACE_ADDRESS, marketplaceAbi } from "@/lib/contracts";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const cid = params?.cid as string;
  const { address, isConnected } = useAccount();
  const [metadata, setMetadata] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!cid) return;
    (async () => {
      try {
        const res = await fetch(`/api/products?cid=${cid}`);
        const json = await res.json();
        if (json.items && json.items.length > 0) {
          setMetadata(json.items[0]);
        }
      } catch {}
    })();
  }, [cid]);

  const productData = useReadContract({
    address: MARKETPLACE_ADDRESS as `0x${string}`,
    abi: marketplaceAbi as any,
    functionName: "getProduct",
    args: [cid],
    query: { enabled: !!cid && !!MARKETPLACE_ADDRESS }
  });

  const hasAccess = useReadContract({
    address: MARKETPLACE_ADDRESS as `0x${string}`,
    abi: marketplaceAbi as any,
    functionName: "hasBuyerAccess",
    args: address ? [address as `0x${string}`, cid] : undefined,
    query: { enabled: !!address && !!cid && !!MARKETPLACE_ADDRESS }
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const seller = (productData?.data as any)?.[0] as string | undefined;
  const priceWei = (productData?.data as any)?.[1] as bigint | undefined;
  const exists = (productData?.data as any)?.[2] as boolean | undefined;
  const alreadyOwned = hasAccess?.data as boolean;
  const isLoadingPrice = productData?.isLoading;

  async function handleBuy() {
    if (!cid || priceWei === undefined || !isConnected) return;
    writeContract({
      address: MARKETPLACE_ADDRESS as `0x${string}`,
      abi: marketplaceAbi as any,
      functionName: "purchase",
      args: [cid],
      value: priceWei
    });
  }

  async function handleDownload() {
    if (!cid || !address) return;
    setDownloading(true);
    try {
      const message = `download:${cid}`;
      const signature = await (window as any).ethereum?.request({
        method: "personal_sign",
        params: [message, address]
      });
      
      const res = await fetch(`/api/download/${cid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = metadata?.name || cid;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        alert("Download failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  if (!cid) return <div className="max-w-7xl mx-auto px-6 py-12">Invalid product</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button 
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        ← Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center text-9xl mb-6 overflow-hidden shadow-xl">
            {metadata?.imageCid ? (
              <img 
                src={`https://gateway.lighthouse.storage/ipfs/${metadata.imageCid}`} 
                alt={metadata.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>📄</span>
            )}
          </div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Product Details</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-sm px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🔗 Share
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>File CID:</span>
                <span className="font-mono text-xs">{cid.slice(0, 10)}...{cid.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Network:</span>
                <span className="font-semibold">Polygon Amoy</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Size:</span>
                <span>{metadata?.size ? Math.ceil(metadata.size / 1024) + " KB" : "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Storage:</span>
                <span>IPFS (Decentralized)</span>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="mb-6">
            {metadata?.category && <Badge className="mb-3">{metadata.category}</Badge>}
            <h1 className="text-4xl font-bold mb-4">
              {metadata?.name || "Loading..."}
            </h1>
            <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>
              {metadata?.description || "No description available"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Price</span>
              <span className="text-4xl font-bold" style={{ color: 'var(--primary-dark)' }}>
                {isLoadingPrice ? (
                  <span className="text-gray-400 text-2xl">Loading...</span>
                ) : priceWei ? (
                  `${(Number(priceWei) / 1e18).toFixed(3)} MATIC`
                ) : metadata?.priceWei ? (
                  `${(Number(metadata.priceWei) / 1e18).toFixed(3)} MATIC`
                ) : (
                  "Free"
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 pb-4 border-b border-yellow-300">
              <span style={{ color: 'var(--text-muted)' }}>Seller:</span>
              <span className="font-mono text-sm font-semibold">
                {seller ? `${seller.slice(0, 6)}...${seller.slice(-4)}` : metadata?.owner ? `${metadata.owner.slice(0, 6)}...${metadata.owner.slice(-4)}` : "Loading..."}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>💰 You pay: {isLoadingPrice ? "..." : priceWei !== undefined ? `${(Number(priceWei) / 1e18).toFixed(3)} MATIC` : "0"}</span>
              <span style={{ color: 'var(--text-muted)' }}>Seller gets: {isLoadingPrice ? "..." : priceWei !== undefined ? `${((Number(priceWei) / 1e18) * 0.8).toFixed(3)} MATIC` : "0"} (80%)</span>
            </div>
          </div>

          {alreadyOwned ? (
            <div>
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4 text-center">
                <p className="text-green-700 font-semibold">✅ You own this product</p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "⬇️ Download Now"}
              </Button>
              <p className="text-sm text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                You can download this product once
              </p>
            </div>
          ) : !isConnected ? (
            <div className="text-center">
              <p className="mb-4 text-gray-600">Please connect your wallet to purchase this product</p>
              <Button className="w-full" onClick={() => window.location.href = "/"}>
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div>
              <Button 
                className="w-full" 
                onClick={handleBuy}
                disabled={isPending || priceWei === undefined}
              >
                {isPending ? "⏳ Processing..." : isSuccess ? "✅ Purchase Complete!" : priceWei === BigInt(0) ? "🎁 Get Free" : "🛒 Buy Now"}
              </Button>
              {priceWei === undefined && !isLoadingPrice && (
                <p className="text-sm text-center mt-2 text-red-500">
                  Product not listed on blockchain. Please contact seller.
                </p>
              )}
              {isSuccess && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-4 text-center">
                  <p className="text-green-700 font-semibold">
                    ✅ Purchase successful! You can now download the product.
                  </p>
                  <Button className="mt-3" onClick={handleDownload}>
                    ⬇️ Download Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
