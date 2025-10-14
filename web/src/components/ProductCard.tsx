"use client";
import Link from "next/link";
import React from "react";

export default function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden flex flex-col">
      <Link href={`/product/${product.cid}`} className="block h-40 bg-gray-200">
        <img src={product.image || '/placeholder.png'} alt={product.name || product.cid} className="w-full h-40 object-cover" />
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm font-semibold truncate">{product.name || product.cid}</div>
        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description || "No description"}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-medium">{product.priceWei ? (Number(product.priceWei)/1e18).toFixed(3) : '—'} MATIC</div>
          <div className="text-xs text-muted-foreground">{String(product.seller || '').slice(0,6)}...{String(product.seller || '').slice(-4)}</div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href={`/product/${product.cid}`} className="flex-1 text-center rounded-xl btn-accent py-2">View</Link>
          <button className="flex-1 rounded-xl border py-2">Buy</button>
        </div>
      </div>
    </div>
  );
}
