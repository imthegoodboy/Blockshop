"use client";
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { marketplaceAbi, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import { Button, Input } from "@/components/ui";
import lighthouse from "@lighthouse-web3/sdk";

export default function SellPage() {
	const { address } = useAccount();
	const [file, setFile] = useState<File | null>(null);
	const [priceEth, setPriceEth] = useState("0.01");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("file");
	const [cid, setCid] = useState("");
	const [status, setStatus] = useState("");
	const { writeContract, data: txHash, isPending } = useWriteContract();
	const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

	async function onUploadToIpfs() {
		if (!file) return;
		setStatus("Uploading to Lighthouse...");
		const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || process.env.LIGHTHOUSE_API_KEY;
		if (!apiKey) { setStatus("Missing LIGHTHOUSE_API_KEY env"); return; }
		try {
			const response = await lighthouse.uploadBuffer(file, apiKey);
			// response.data.Hash contains the CID
			const theCid = (response as any)?.data?.Hash as string;
			if (!theCid) { setStatus("Upload failed: no CID"); return; }
            setCid(theCid);
            setStatus("Uploaded. CID: " + theCid);
            // Save basic metadata (cid, owner, filename, size) to DB
            try {
                const metaRes = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cid: theCid,
                        owner: address,
                        name: name || file.name,
                        description,
                        size: file.size,
                        category: category || file.type?.split("/")?.[0] || "file",
                        priceWei: String(Math.floor(parseFloat(priceEth || "0") * 1e18))
                    })
                });
                if (!metaRes.ok) {
                    console.warn("Failed saving metadata");
                }
            } catch {}
		} catch (e: any) {
			setStatus("Upload failed: " + (e?.message || "unknown error"));
		}
	}

	async function onList() {
		if (!cid) { setStatus("Upload first"); return; }
        const priceWei = BigInt(Math.floor(parseFloat(priceEth || "0") * 1e18));
		writeContract({
			abi: marketplaceAbi as any,
			address: MARKETPLACE_ADDRESS as `0x${string}`,
			functionName: "listProduct",
			args: [cid, priceWei]
		});
	}

    return (
        <div className="max-w-xl mx-auto p-6 space-y-4">
            <h2 className="text-xl font-semibold">Sell a product</h2>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="Category (e.g. book, image, code)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input placeholder="Price in MATIC (e.g., 0.01)" value={priceEth} onChange={(e) => setPriceEth(e.target.value)} />
            <div className="flex gap-2">
                <Button variant="outline" onClick={onUploadToIpfs}>Upload to IPFS</Button>
                <Button onClick={onList} disabled={isPending}>List on-chain</Button>
            </div>
            <p className="text-sm text-muted-foreground">{status}</p>
            {txHash && <p>Tx: {txHash}</p>}
            {isSuccess && <p>Listed!</p>}
        </div>
    );
}


