import { createPublicClient, http, verifyMessage } from "viem";
import { polygonAmoy } from "viem/chains";
import { marketplaceAbi, MARKETPLACE_ADDRESS } from "@/lib/contracts";

export async function POST(req: Request, { params }: any): Promise<Response> {
	const { cid } = params as { cid?: string } || {};
	if (!cid) return new Response("Missing cid", { status: 400 });
	const { address, signature } = await req.json().catch(() => ({}));
	if (!address || !signature) return new Response("Missing address/signature", { status: 400 });

	const message = `download:${cid}`;
	const okSig = await verifyMessage({ address, message, signature }).catch(() => false);
	if (!okSig) return new Response("Bad signature", { status: 401 });

    const client = createPublicClient({ chain: polygonAmoy, transport: http() });
    const hasAccess = await client.readContract({
        abi: marketplaceAbi as any,
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        functionName: "hasBuyerAccess",
        account: address as `0x${string}`,
        args: [cid]
    }).catch(() => false) as boolean;

	if (!hasAccess) return new Response("No access", { status: 403 });

	const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
	const resp = await fetch(gatewayUrl);
	if (!resp.ok || !resp.body) return new Response("Fetch failed", { status: 502 });

	const fileName = resp.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || `${cid}`;
	const contentType = resp.headers.get("content-type") || "application/octet-stream";
	return new Response(resp.body, {
		headers: {
			"Content-Type": contentType,
			"Content-Disposition": `attachment; filename="${fileName}"`
		}
	});
}


