import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get("q")?.toLowerCase()?.trim() || "";
        const category = url.searchParams.get("category")?.toLowerCase()?.trim();
        const db = await getDb();
        const filter: any = {};
        if (q) filter["$or"] = [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { cid: { $regex: q, $options: "i" } }
        ];
        if (category) filter.category = category;
        const items = await db.collection("products").find(filter, { projection: { _id: 1, cid: 1, name: 1, size: 1, category: 1, owner: 1, priceWei: 1, description: 1, imageCid: 1 } }).sort({ _id: -1 }).limit(200).toArray();
        return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "db error" }), { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { cid, owner, name, size, category, description, priceWei, imageCid } = body || {};
        if (!cid) return new Response("cid required", { status: 400 });
        const db = await getDb();
        const doc = {
            cid,
            owner: owner || null,
            name: name || null,
            size: Number(size) || null,
            category: String(category || "other").toLowerCase(),
            description: description || "",
            priceWei: typeof priceWei === "string" || typeof priceWei === "number" ? String(priceWei) : null,
            imageCid: imageCid || null,
            createdAt: new Date()
        };
        const result = await db.collection("products").updateOne({ cid }, { $set: doc }, { upsert: true });
        return new Response(JSON.stringify({ ok: true, upsertedId: result.upsertedId || null }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "db error" }), { status: 500 });
    }
}


