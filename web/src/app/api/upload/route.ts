import { NextRequest } from "next/server";
import lighthouse from "@lighthouse-web3/sdk";

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
        const response = await lighthouse.uploadBuffer(buffer, apiKey);
        const cid = (response as any)?.data?.Hash;

        if (!cid) {
            return new Response(JSON.stringify({ error: "Upload failed: no CID returned" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ cid }), {
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
