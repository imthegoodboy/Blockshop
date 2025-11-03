"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function ProductCard({ product }: { product: any }) {
  const { address } = useAccount();
  const [fav, setFav] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!address) return;
        const res = await fetch(`/api/favorites?address=${address}`);
        const json = await res.json();
        const set = new Set((json.items || []).map((x: any) => x.cid));
        if (mounted) setFav(set.has(product.cid));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [address, product?.cid]);

  async function toggleFav() {
    if (!address) return;
    try {
      if (!fav) {
        const message = `fav:add:${product.cid}`;
        const signature = await (window as any).ethereum?.request({ method: "personal_sign", params: [message, address] });
        await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address, cid: product.cid, signature }) });
        setFav(true);
      } else {
        const message = `fav:del:${product.cid}`;
        const signature = await (window as any).ethereum?.request({ method: "personal_sign", params: [message, address] });
        await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address, cid: product.cid, signature }) });
        setFav(false);
      }
    } catch {}
  }

  const imgSrc = product.imageCid ? `https://gateway.lighthouse.storage/ipfs/${product.imageCid}` : (product.image || "/product-placeholder.png");

  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden flex flex-col">
      <div className="relative">
        <Link href={`/product/${product.cid}`} className="block h-40 bg-gray-200">
          <img src={imgSrc} alt={product.name || product.cid} className="w-full h-40 object-cover" />
        </Link>
        <button onClick={toggleFav} className="absolute top-2 right-2 rounded-full bg-white/80 px-3 py-1 text-sm">
          {fav ? "★ Saved" : "☆ Save"}
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm font-semibold truncate">{product.name || product.cid}</div>
        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description || "No description"}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-medium">{product.priceWei ? (Number(product.priceWei)/1e18).toFixed(3) : '—'} MATIC</div>
          <div className="text-xs text-muted-foreground">{String(product.seller || '').slice(0,6)}...{String(product.seller || '').slice(-4)}</div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href={`/product/${product.cid}`} className="flex-1 text-center rounded-xl btn-accent py-2">View</Link>
          <Link href={`/product/${product.cid}`} className="flex-1 text-center rounded-xl border py-2">Buy</Link>
        </div>
      </div>
    </div>
  );
}
