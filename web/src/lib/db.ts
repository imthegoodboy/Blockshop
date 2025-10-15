import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "blockshopy";

// Quick guard to catch common misconfiguration when deploying to serverless hosts
// (Render, Vercel, etc.) that block access to private/internal hostnames.
function uriLooksPrivate(u: string) {
    if (!u) return false;
    const s = u.toLowerCase();
    // common local/private indicators
    const locals = ["localhost", "127.", "10.", "192.168.", ".local", "169.254."];
    return locals.some(p => s.includes(p));
}

let client: MongoClient | null = null;
export async function getDb() {
    if (!uri) throw new Error("MONGODB_URI missing — set MONGODB_URI in your environment (do not use localhost for deployed services)");
    if (uriLooksPrivate(uri)) {
        // Helpful error so the deploy logs point clearly to the misconfigured host
        throw new Error(
            "MONGODB_URI appears to point to a private/local hostname (localhost, 127.0.0.1, 10.x.x.x, 192.168.x.x, or .local). " +
            "Serverless deployments (Render, Vercel) cannot reach private hostnames. " +
            "Use a publicly reachable MongoDB (for example MongoDB Atlas with an SRV connection string) or configure a network peering/allowed IPs."
        );
    }
    if (!client) client = new MongoClient(uri);
    // calling connect is safe even if already connected; avoid checking internal topology fields
    await client.connect();
    return client.db(dbName);
}




