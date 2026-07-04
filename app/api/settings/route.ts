import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// 🔑 FIXED INITIALIZATION: Explicitly formatting the Redis URL to HTTPS REST format for Upstash
const getRedisClient = () => {
  const rawUrl = process.env.OMDIAMONDS_REDIS_URL;
  if (!rawUrl) return null;

  // If it's a redis:// or rediss:// URL, convert it to a secure REST https:// URL
  const restUrl = rawUrl.startsWith("redis")
    ? rawUrl.replace(/^redis(s)?:\/\//, "https://")
    : rawUrl;

  // Extract the token if it's embedded in a standard Redis URL (username:token@host)
  let token = "";
  if (restUrl.includes("@")) {
    const credentials = restUrl.split("://")[1]?.split("@")[0];
    if (credentials && credentials.includes(":")) {
      token = credentials.split(":")[1];
    }
  }

  return new Redis({
    url: restUrl,
    token: token,
  });
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
