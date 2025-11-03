import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { verifyMessage } from "viem";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get("address") as `0x${string}` | null;
    if (!address) return new Response("address required", { status: 400 });
    const db = await getDb();
    const items = await db.collection("favorites").find({ address: address.toLowerCase() }).project({ _id: 0, cid: 1 }).toArray();
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address, cid, signature } = await req.json();
    if (!address || !cid || !signature) return new Response("missing fields", { status: 400 });
    const message = `fav:add:${cid}`;
    const okSig = await verifyMessage({ address, message, signature }).catch(() => false);
    if (!okSig) return new Response("bad signature", { status: 401 });
    const db = await getDb();
    await db.collection("favorites").updateOne(
      { address: String(address).toLowerCase(), cid },
      { $set: { address: String(address).toLowerCase(), cid, createdAt: new Date() } },
      { upsert: true }
    );
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { address, cid, signature } = await req.json();
    if (!address || !cid || !signature) return new Response("missing fields", { status: 400 });
    const message = `fav:del:${cid}`;
    const okSig = await verifyMessage({ address, message, signature }).catch(() => false);
    if (!okSig) return new Response("bad signature", { status: 401 });
    const db = await getDb();
    await db.collection("favorites").deleteOne({ address: String(address).toLowerCase(), cid });
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
  }
}
