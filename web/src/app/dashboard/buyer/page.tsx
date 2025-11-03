"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

type Purchase = {
  cid: string;
  name: string;
  category: string;
  price: string;
};

const dummyPurchases: Purchase[] = [
  { cid: "QmDemoCID1", name: "Demo Book PDF", category: "Books", price: "0.05" },
  { cid: "QmDemoCID2", name: "Website Clone Code", category: "Code", price: "0.10" }
];

export default function BuyerDashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>(dummyPurchases);
  return (
    <section className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-pink-600 mb-6">Buyer Dashboard</h1>
      <div className="space-y-4">
        {purchases.length === 0 ? (
          <div className="text-muted-foreground">No purchases yet.</div>
        ) : (
          purchases.map((p) => (
            <div key={p.cid} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category} · {p.price} MATIC</div>
              </div>
              <Button className="bg-pink-600 text-white">Download</Button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
