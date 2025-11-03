import { createPublicClient, http, verifyMessage } from "viem";
import { polygonAmoy, polygon } from "viem/chains";
import { marketplaceAbi, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import { getDb } from "@/lib/db";

function getChain() {
	const net = (((globalThis as any).process?.env?.NEXT_PUBLIC_CHAIN) || "amoy").toLowerCase();
	return net === "polygon" || net === "mainnet" ? polygon : polygonAmoy;
}

function b64ToBytes(b64: string): Uint8Array {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	const lookup = new Uint8Array(256);
	for (let i = 0; i < alphabet.length; i++) lookup[alphabet.charCodeAt(i)] = i;
	let padding = 0;
	if (b64.endsWith("==")) padding = 2; else if (b64.endsWith("=")) padding = 1;
	const len = b64.length;
	const outLen = ((len / 4) * 3) - padding;
	const bytes = new Uint8Array(outLen);
	let o = 0;
	for (let i = 0; i < len; i += 4) {
		const c1 = lookup[b64.charCodeAt(i)];
		const c2 = lookup[b64.charCodeAt(i + 1)];
		const c3 = lookup[b64.charCodeAt(i + 2)];
		const c4 = lookup[b64.charCodeAt(i + 3)];
		const triple = (c1 << 18) | (c2 << 12) | ((c3 & 63) << 6) | (c4 & 63);
		if (o < outLen) bytes[o++] = (triple >> 16) & 0xff;
		if (o < outLen) bytes[o++] = (triple >> 8) & 0xff;
		if (o < outLen) bytes[o++] = triple & 0xff;
	}
	return bytes;
}

function ensureArrayBuffer(ab: ArrayBuffer | SharedArrayBuffer): ArrayBuffer {
	if (ab instanceof ArrayBuffer) return ab;
	const view = new Uint8Array(ab as any);
	const copy = new Uint8Array(view.length);
	copy.set(view);
	return copy.buffer;
}

async function decryptIfNeeded(cid: string, data: ArrayBuffer) {
	const db = await getDb();
	const keyDoc = await db.collection("keys").findOne({ cid });
	if (!keyDoc) return data; // not encrypted
	if (keyDoc.alg !== "aes-256-gcm") return data;
	const keyBytes = b64ToBytes(String(keyDoc.keyB64));
	const ivBytes = b64ToBytes(String(keyDoc.ivB64));
	const subtle = (globalThis as any).crypto?.subtle;
	if (!subtle) return data;
	const cryptoKey = await subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
	try {
		const dec = await subtle.decrypt({ name: "AES-GCM", iv: ivBytes, tagLength: 128 }, cryptoKey, data);
		return dec;
	} catch {
		return data;
	}
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
	const decAb = await decryptIfNeeded(cid, arrBuf);

	const fileName = `${cid}`;
	const finalized = ensureArrayBuffer(decAb as ArrayBuffer | SharedArrayBuffer);
	return new Response(finalized, {
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Disposition": `attachment; filename="${fileName}"`
		}
	});
}


