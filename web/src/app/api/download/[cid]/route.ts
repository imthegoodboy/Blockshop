import { createPublicClient, http, verifyMessage } from "viem";
import { polygonAmoy, polygon } from "viem/chains";
import { marketplaceAbi, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import { getDb } from "@/lib/db";
import crypto from "crypto";

function getChain() {
	const net = (process.env.NEXT_PUBLIC_CHAIN || "amoy").toLowerCase();
	return net === "polygon" || net === "mainnet" ? polygon : polygonAmoy;
}

async function decryptIfNeeded(cid: string, data: Buffer) {
	const db = await getDb();
	const keyDoc = await db.collection("keys").findOne({ cid });
	if (!keyDoc) return data; // not encrypted
	if (keyDoc.alg !== "aes-256-gcm") return data;
	const key = Buffer.from(String(keyDoc.keyB64), "base64");
	const iv = Buffer.from(String(keyDoc.ivB64), "base64");
	// last 16 bytes are GCM tag
	if (data.length < 17) return data;
	const body = data.subarray(0, data.length - 16);
	const tag = data.subarray(data.length - 16);
	const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(tag);
	const dec = Buffer.concat([decipher.update(body), decipher.final()]);
	return dec;
}

export async function POST(req: Request, { params }: any): Promise<Response> {
	const { cid } = (params as { cid?: string }) || {};
	if (!cid) return new Response("Missing cid", { status: 400 });
	const { address, signature } = await req.json().catch(() => ({}));
	if (!address || !signature) return new Response("Missing address/signature", { status: 400 });

	const message = `download:${cid}`;
	const okSig = await verifyMessage({ address, message, signature }).catch(() => false);
	if (!okSig) return new Response("Bad signature", { status: 401 });

	const client = createPublicClient({ chain: getChain(), transport: http() });
	const hasAccess = (await client
		.readContract({
			abi: marketplaceAbi as any,
			address: MARKETPLACE_ADDRESS as `0x${string}`,
			functionName: "hasBuyerAccess",
			args: [address as `0x${string}`, cid]
		})
		.catch(() => false)) as boolean;

	if (!hasAccess) return new Response("No access", { status: 403 });

	const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
	const resp = await fetch(gatewayUrl);
	if (!resp.ok) return new Response("Fetch failed", { status: 502 });
	const arrBuf = await resp.arrayBuffer();
	const encBuf = Buffer.from(arrBuf);
	const decBuf = await decryptIfNeeded(cid, encBuf);

	const fileName = `${cid}`;
	const blob = new Blob([decBuf], { type: "application/octet-stream" });
	return new Response(blob, {
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Disposition": `attachment; filename="${fileName}"`
		}
	});
}


