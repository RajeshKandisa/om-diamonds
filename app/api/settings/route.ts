import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// The Upstash client automatically picks up the OMDIAMONDS_REDIS_URL REST string!
const redisClient = process.env.OMDIAMONDS_REDIS_URL 
  ? Redis.fromEnv({
      url: process.env.OMDIAMONDS_REDIS_URL.includes("://") 
        ? process.env.OMDIAMONDS_REDIS_URL.replace("redis://", "https://").replace("rediss://", "https://")
        : process.env.OMDIAMONDS_REDIS_URL,
      token: process.env.OMDIAMONDS_REDIS_TOKEN || "", // Upstash driver splits url and token internally if using plain credentials
    })
  : null;

// If your URL string contains the full token embedded, we can pass it directly:
const directRedis = process.env.OMDIAMONDS_REDIS_URL 
  ? new Redis({
      url: process.env.OMDIAMONDS_REDIS_URL.replace("redis://", "https://").replace("rediss://", "https://"),
      token: process.env.OMDIAMONDS_REDIS_URL.split("@")[0].split("://")[1]?.split(":")[1] || "" 
    })
  : null;

export async function GET() {
  try {
    // Fallback logic if the string structure needs basic formatting
    const client = directRedis || redisClient;
    if (!client) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }

    const data: any = await client.get("om_diamonds_settings");
    
    if (!data) {
      return NextResponse.json({
        defaultGoldRate: "14000",
        defaultDiamondRate: "60000",
        defaultWastagePct: "8.0",
        defaultColorStoneRate: "200",
        defaultCertRate: "700"
      });
    }
    
    // Upstash automatically parses JSON strings back into objects!
    return NextResponse.json(typeof data === "string" ? JSON.parse(data) : data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = directRedis || redisClient;
    if (!client) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }

    const body = await request.json();
    await client.set("om_diamonds_settings", body); // No need to JSON.stringify, Upstash handles objects natively!
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
