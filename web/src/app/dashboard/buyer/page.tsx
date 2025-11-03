"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui";

export default function BuyerDashboard() {
  const { address } = useAccount();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!address) return;
        const res = await fetch(`/api/purchases?address=${address}`);
        const json = await res.json();
        setItems(json.items || []);
      } catch {}
    })();
  }, [address]);

  return (
    <section className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Buyer Dashboard</h1>
      <div className="space-y-4">
        {(!items || items.length === 0) ? (
          <div className="text-muted-foreground">No purchases yet.</div>
        ) : (
          items.map((p) => (
            <div key={`${p.address}-${p.cid}-${p.createdAt}`} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold font-mono text-sm">{p.cid.slice(0,10)}...{p.cid.slice(-8)}</div>
                <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
              <Button onClick={() => window.location.href = `/product/${p.cid}`}>View</Button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
