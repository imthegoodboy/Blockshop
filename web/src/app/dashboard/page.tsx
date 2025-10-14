"use client";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { marketplaceAbi, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import { Input } from "@/components/ui";

// Minimal dashboard showing seller products by entering their own CIDs
export default function DashboardPage() {
	const { address } = useAccount();
	const [cid, setCid] = useState("");
    const product = useReadContract(cid
        ? {
            abi: marketplaceAbi as any,
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            functionName: "getProduct",
            args: [cid]
        }
        : (undefined as any)
    );

	return (
		<div className="max-w-xl mx-auto p-6 space-y-4">
			<h2 className="text-xl font-semibold">Seller dashboard</h2>
			<p className="text-sm text-muted-foreground">Connected: {address || "not connected"}</p>
            <Input placeholder="Enter your product CID" value={cid} onChange={(e) => setCid(e.target.value)} />
            {product?.data ? (
				<div className="border rounded p-3">
					<p>CID: {cid}</p>
                    <p>Price (MATIC): {Number((product.data as any)[1]) / 1e18}</p>
					<p>Seller: {(product.data as any)[0]}</p>
				</div>
            ) : null}
		</div>
	);
}


