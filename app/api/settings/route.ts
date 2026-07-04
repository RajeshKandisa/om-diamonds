import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Locate the JSON database file path securely on the system
const dataFilePath = path.join(process.cwd(), "data", "settings.json");

// 1. GET: Fetches the current live global configurations for anyone opening the app
export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: "Configuration database file missing" }, { status: 404 });
    }
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read database configurations" }, { status: 500 });
  }
}

// 2. POST: Overwrites the shared JSON file instantly when a manager modifies a setting
export async function POST(request: Request) {
  try {
    const updatedSettings = await request.json();
    
    // Ensure the data directory exists safely
    const dirPath = path.dirname(dataFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write synchronized settings over the server's data file
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedSettings, null, 2), "utf8");
    return NextResponse.json({ success: true, message: "Global configurations synchronized successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to synchronize configurations globally" }, { status: 500 });
  }
}