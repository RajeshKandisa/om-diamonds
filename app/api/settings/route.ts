import { NextResponse } from "next/server";
import Redis from "ioredis";

// Initialize the database client using your explicit environment key layout
const redisClient = process.env.OMDIAMONDS_REDIS_URL 
  ? new Redis(process.env.OMDIAMONDS_REDIS_URL) 
  : null;

// GET: Triggers automatically for everyone loading the website to fetch current settings
export async function GET() {
  try {
    if (!redisClient) {
      throw new Error("Redis connection string OMDIAMONDS_REDIS_URL is missing in environment variables.");
    }

    const rawData = await redisClient.get("om_diamonds_settings");
    
    // If the database is brand new and empty, return safe hardcoded fallbacks
    if (!rawData) {
      return NextResponse.json({
        defaultGoldRate: "14000",
        defaultDiamondRate: "60000",
        defaultWastagePct: "8.0",
        defaultColorStoneRate: "200",
        defaultCertRate: "700"
      });
    }

    return NextResponse.json(JSON.parse(rawData));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Triggers when an admin edits a settings field, saving updates globally
export async function POST(request) {
  try {
    if (!redisClient) {
      throw new Error("Redis connection string OMDIAMONDS_REDIS_URL is missing in environment variables.");
    }

    const body = await request.json();
    
    // Standard Redis saves values as raw string text blocks, so stringify the payload
    await redisClient.set("om_diamonds_settings", JSON.stringify(body));
    
    return NextResponse.json({ success: true });
  } catch (err) {
    // 🔑 CHANGED HERE: Return the actual error message to see what went wrong!
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
