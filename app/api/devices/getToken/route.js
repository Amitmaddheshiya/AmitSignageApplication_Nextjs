import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const deviceId = url.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId required" }, { status: 400 });
    }

    // ✅ Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("signage"); // your DB name

    // ✅ Fetch device from 'devices' collection
    const device = await db.collection("devices").findOne({ deviceId });
    if (!device || !device.token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json({ token: device.token });
  } catch (err) {
    console.error("getToken error:", err); // logs the real error
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
