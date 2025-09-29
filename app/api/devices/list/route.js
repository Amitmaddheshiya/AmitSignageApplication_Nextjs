import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("signage");

    const devices = await db.collection("devices").find({}).toArray();

    if (!devices || devices.length === 0) {
      return NextResponse.json({ error: "No devices found" }, { status: 404 });
    }

    return NextResponse.json({ devices });
  } catch (err) {
    console.error("Devices list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
