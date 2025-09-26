import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const cookie = req.headers.get("cookie") || '';
    const m = cookie.match(/signage_auth=([^;]+)/);
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = m[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ✅ Get devices
    const client = await clientPromise;
    const db = client.db("signage");
    const devices = await db.collection("devices").find({}).toArray();

    return NextResponse.json({ devices });
  } catch (err) {
    console.error("Devices list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
