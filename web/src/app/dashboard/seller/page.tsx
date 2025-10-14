"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button, Input, Textarea, Card, Badge } from "@/components/ui";
import { MARKETPLACE_ADDRESS, marketplaceAbi } from "@/lib/contracts";

export default function SellerDashboard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [products, setProducts] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priceEth, setPriceEth] = useState("0.01");
  const [cid, setCid] = useState("");
  const [imageCid, setImageCid] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
    loadProducts();
  }, [isConnected, address]);

  async function loadProducts() {
    if (!address) return;
    try {
      const res = await fetch(`/api/products?owner=${address}`);
      const json = await res.json();
      setProducts(json.items || []);
    } catch {}
  }

  async function handleUpload() {
    if (!file || !address) return;
    setUploading(true);
    setStatus("Uploading product file to IPFS...");
    
    try {
      // Upload product file
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
        setStatus("Upload failed: " + errorData.error);
        setUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      const uploadedCid = uploadData.cid;
      
      if (!uploadedCid) {
        setStatus("Upload failed: no CID returned");
        setUploading(false);
        return;
      }

      setCid(uploadedCid);

      // Upload product image if provided
      let uploadedImageCid = "";
      if (imageFile) {
        setStatus("Uploading product image to IPFS...");
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);

        const imageUploadRes = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData
        });

        if (imageUploadRes.ok) {
          const imageUploadData = await imageUploadRes.json();
          uploadedImageCid = imageUploadData.cid || "";
          setImageCid(uploadedImageCid);
        }
      }

      setStatus(`Uploaded! Saving to database...`);

      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cid: uploadedCid,
          imageCid: uploadedImageCid,
          owner: address,
          name: name || file.name,
          description,
          size: file.size,
          category: category || "other",
          priceWei: String(Math.floor(parseFloat(priceEth || "0") * 1e18))
        })
      });

      setStatus("Listing on blockchain...");
      const priceWei = BigInt(Math.floor(parseFloat(priceEth || "0") * 1e18));
      
      writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: marketplaceAbi as any,
        functionName: "listProduct",
        args: [uploadedCid, priceWei]
      });
    } catch (e: any) {
      setStatus("Error: " + (e?.message || "unknown"));
      setUploading(false);
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setStatus("Product listed successfully!");
      setUploading(false);
      setShowUpload(false);
      setFile(null);
      setImageFile(null);
      setName("");
      setDescription("");
      setCategory("");
      setPriceEth("0.01");
      setCid("");
      setImageCid("");
      loadProducts();
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Please connect your wallet</h1>
        <p style={{ color: 'var(--text-muted)' }}>You need to connect your wallet to access the seller dashboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Seller Dashboard</h1>
        <Button onClick={() => setShowUpload(true)}>
          ➕ Upload New Product
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-4xl font-bold">{products.length}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-4xl font-bold">0</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-4xl font-bold">0 MATIC</p>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">My Products</h2>
        {products.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-xl mb-4">📦 No products yet</p>
            <p style={{ color: 'var(--text-muted)' }} className="mb-6">
              Upload your first digital product to start selling!
            </p>
            <Button onClick={() => setShowUpload(true)}>
              Upload Product
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Card key={p._id || p.cid} onClick={() => router.push(`/product/${p.cid}`)} className="cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mb-4 flex items-center justify-center text-3xl overflow-hidden">
                  {p.imageCid ? (
                    <img 
                      src={`https://gateway.lighthouse.storage/ipfs/${p.imageCid}`} 
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>📄</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 truncate">{p.name}</h3>
                <div className="flex items-center justify-between">
                  {p.category && <Badge>{p.category}</Badge>}
                  <span className="font-bold">
                    {p.priceWei ? `${(Number(p.priceWei) / 1e18).toFixed(3)} MATIC` : "Free"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Upload New Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name *</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Premium eBook Guide"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <Input 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    placeholder="e.g., eBooks, Templates, Code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (MATIC) *</label>
                  <Input 
                    type="number" 
                    step="0.001"
                    value={priceEth} 
                    onChange={(e) => setPriceEth(e.target.value)} 
                    placeholder="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="input-field"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Upload a preview image for your product (JPG, PNG, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Product File *</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="input-field"
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Upload your digital product (PDF, ZIP, images, etc.)
                </p>
              </div>

              {status && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                  <p className="text-sm">{status}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleUpload}
                  disabled={!file || !name || uploading || isPending}
                  className="flex-1"
                >
                  {uploading || isPending ? "Uploading..." : "Upload & List"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowUpload(false);
                    setStatus("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
