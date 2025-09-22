import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    // 🔑 Auth check
    const auth = req.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
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
