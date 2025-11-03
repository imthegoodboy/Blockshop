"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Button } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        const items = json.items || [];
        setProducts(items);
        
        const cats = new Set<string>();
        items.forEach((p: any) => {
          if (p.category) cats.add(p.category);
        });
        setCategories(Array.from(cats));
      } catch {}
    })();
  }, []);

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <div className="primary-gradient text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            🛍️ Digital Marketplace on Blockchain
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Buy and sell digital products securely with cryptocurrency
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              onClick={() => router.push('/explore')}
              style={{ background: 'white', color: 'var(--primary-dark)' }}
            >
              Browse Products
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/seller')}
              style={{ borderColor: 'white', color: 'white', background: 'transparent' }}
            >
              Start Selling
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border-y border-purple-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-2 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-purple-200">
            <span>🔷</span>
            <strong>Built on Polygon</strong>
          </span>
          <span className="text-purple-700">Low fees, fast finality, eco‑friendly</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "badge" : "badge opacity-50"}
            >
              All
            </button>
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "badge" : "badge opacity-50"}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl mb-4">🎯 No products yet</p>
            <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>
              Be the first to list a digital product!
            </p>
            <Button onClick={() => router.push('/dashboard/seller')}>
              List Your Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 12).map((product) => (
              <Card 
                key={product._id || product.cid}
                onClick={() => router.push(`/product/${product.cid}`)}
                className="cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mb-4 flex items-center justify-center text-4xl overflow-hidden">
                  {product.imageCid ? (
                    <img 
                      src={`https://gateway.lighthouse.storage/ipfs/${product.imageCid}`} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>📄</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {product.name || "Untitled"}
                </h3>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {product.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  {product.category && (
                    <Badge className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                  <span className="font-bold text-lg">
                    {product.priceWei ? `${(Number(product.priceWei) / 1e18).toFixed(3)} MATIC` : "Free"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length > 12 && (
          <div className="text-center mt-12">
            <Button onClick={() => router.push('/explore')}>
              View All Products
            </Button>
          </div>
        )}
      </div>

      <div className="py-16 px-6" style={{ background: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure & Transparent</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              All transactions secured by Polygon blockchain
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2">Digital Ownership</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              True ownership of your digital products
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Instant Access</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Download your purchases immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
