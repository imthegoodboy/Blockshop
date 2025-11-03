import { NextRequest } from "next/server";
import lighthouse from "@lighthouse-web3/sdk";
import { getDb } from "@/lib/db";
import crypto from "crypto";

async function encryptAesGcm(plain: Buffer) {
	const iv = crypto.randomBytes(12);
	const key = crypto.randomBytes(32);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
	const tag = cipher.getAuthTag();
	return { encData: Buffer.concat([enc, tag]), key, iv };
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || process.env.LIGHTHOUSE_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Lighthouse API key not configured" }), { 
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { encData, key, iv } = await encryptAesGcm(buffer);

        const response = await lighthouse.uploadBuffer(encData, apiKey);
        const cid = (response as any)?.data?.Hash;

        if (!cid) {
            return new Response(JSON.stringify({ error: "Upload failed: no CID returned" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const db = await getDb();
        await db.collection("keys").updateOne(
            { cid },
            { $set: {
                cid,
                alg: "aes-256-gcm",
                ivB64: iv.toString("base64"),
                keyB64: key.toString("base64"),
                createdAt: new Date()
            }},
            { upsert: true }
        );

        return new Response(JSON.stringify({ cid, encrypted: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        console.error("Upload error:", e);
        return new Response(JSON.stringify({ error: e?.message || "Upload failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
