import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const cid = url.searchParams.get("cid");
		const category = url.searchParams.get("category")?.toLowerCase()?.trim();
		const q = url.searchParams.get("q")?.toLowerCase()?.trim();
		const db = await getDb();
		const filter: any = {};
		if (category) filter.category = category;
		if (cid) filter.cid = { $ne: cid };
		if (q) {
			filter.$or = [
				{ name: { $regex: q, $options: "i" } },
				{ description: { $regex: q, $options: "i" } }
			];
		}
		const items = await db
			.collection("products")
			.find(filter, { projection: { _id: 0, cid: 1, name: 1, category: 1, priceWei: 1, imageCid: 1 } })
			.limit(12)
			.toArray();
		return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
	}
}
