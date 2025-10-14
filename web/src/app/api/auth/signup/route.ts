import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return new Response("email/password required", { status: 400 });
        const db = await getDb();
        const existing = await db.collection("users").findOne({ email: String(email).toLowerCase() });
        if (existing) return new Response("user exists", { status: 409 });
        const passwordHash = await bcrypt.hash(password, 10);
        await db.collection("users").insertOne({ email: String(email).toLowerCase(), passwordHash, createdAt: new Date() });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
    }
}




