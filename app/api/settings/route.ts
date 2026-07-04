import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// 🔑 FIXED: Uses the native URL parser to strip inline credentials out of the endpoint string
const getRedisClient = () => {
  const rawUrl = process.env.OMDIAMONDS_REDIS_URL;
  if (!rawUrl) return null;

  try {
    // Replace redis:// protocol temporarily with http:// so the native URL parser handles it perfectly
    const parseableUrl = rawUrl.startsWith("redis") 
      ? rawUrl.replace(/^redis(s)?:\/\//, "https://") 
      : rawUrl;
      
    const parsed = new URL(parseableUrl);
    
    // Extract password/token safely from the credentials block
    const token = parsed.password || parsed.username || "";
    
    // Construct a completely clean URL endpoint free of inline credentials (e.g., https://host:port)
    const cleanRestUrl = `${parsed.protocol}//${parsed.host}`;

    return new Redis({
      url: cleanRestUrl,
      token: token,
    });
  } catch (error) {
    console.error("Failed to parse connection credentials:", error);
    return null;
  }
};

const client = getRedisClient();

export async function GET() {
  try {
    if (!client) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }

    const data = await client.get("om_diamonds_settings");
    
    if (!data) {
      return NextResponse.json({
        defaultGoldRate: "14000",
        defaultDiamondRate: "60000",
        defaultWastagePct: "8.0",
        defaultColorStoneRate: "200",
        defaultCertRate: "700"
      });
    }
    
    return NextResponse.json(typeof data === "string" ? JSON.parse(data) : data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!client) {
      throw new Error("Missing environment variable: OMDIAMONDS_REDIS_URL");
    }

    const body = await request.json();
    await client.set("om_diamonds_settings", body);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
