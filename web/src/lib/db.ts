import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "blockshopy";

let client: MongoClient | null = null;
export async function getDb() {
    if (!uri) throw new Error("MONGODB_URI missing");
    if (!client) client = new MongoClient(uri);
    // calling connect is safe even if already connected; avoid checking internal topology fields
    await client.connect();
    return client.db(dbName);
}




