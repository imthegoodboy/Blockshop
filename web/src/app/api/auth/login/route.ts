import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return new Response("email/password required", { status: 400 });
        const db = await getDb();
        const user = await db.collection("users").findOne({ email: String(email).toLowerCase() });
        if (!user) return new Response("invalid credentials", { status: 401 });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return new Response("invalid credentials", { status: 401 });
        const token = jwt.sign({ uid: String(user._id), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        return new Response(JSON.stringify({ ok: true }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`
            }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 500 });
    }
}




