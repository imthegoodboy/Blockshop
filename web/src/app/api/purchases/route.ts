import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get("address");
    if (!address) return new Response("address required", { status: 400 });
    const db = await getDb();
    const items = await db.collection("purchases").find({ address: String(address).toLowerCase() }).sort({ createdAt: -1 }).limit(200).toArray();
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, cid, txHash } = body || {};
    if (!address || !cid) return new Response("missing fields", { status: 400 });
    const db = await getDb();
    await db.collection("purchases").insertOne({ address: String(address).toLowerCase(), cid, txHash: txHash || null, createdAt: new Date() });
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
  }
}
