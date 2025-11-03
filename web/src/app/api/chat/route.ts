import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
        const { messages } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
                return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500 });
        }

        const systemPrompt = `You are a helpful assistant for a decentralized marketplace built on Polygon blockchain. 

The marketplace allows:
- Sellers to upload digital products (PDFs, images, files, etc.) to IPFS and list them for sale
- Buyers to purchase products using MATIC cryptocurrency
- Automatic payment split: 80% goes to seller, 20% platform commission
- Secure file downloads after purchase verification

Key features:
- Connect wallet to buy or sell
- Upload product with image, name, description, category, and price
- Browse and search products
- Purchase with crypto wallet
- Download after purchase

Help users with questions about buying, selling, wallet connection, payments, and troubleshooting. Be friendly and concise.`;

        const userMessages = Array.isArray(messages) ? messages.join("\n") : String(messages);
        
        const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                        contents: [
                                { role: "user", parts: [{ text: `${systemPrompt}\n\nUser: ${userMessages}` }] }
                        ]
                })
        });
        const json = await resp.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return new Response(JSON.stringify({ text }), { headers: { "Content-Type": "application/json" } });
}


