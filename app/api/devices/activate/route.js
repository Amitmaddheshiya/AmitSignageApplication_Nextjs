import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function POST(req) {
  try {
    const { deviceId, activationKey } = await req.json();

    const client = await clientPromise;
    const db = client.db("signage");

    const device = await db.collection("devices").findOne({ deviceId });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    if (device.activationKey !== activationKey) {
      return NextResponse.json({ error: "Invalid activation key" }, { status: 401 });
    }

    const token = jwt.sign({ deviceId }, JWT_SECRET, { expiresIn: "30d" });

    await db.collection("devices").updateOne(
      { deviceId },
      { $set: { active: true, token } }
    );

    return NextResponse.json({ message: "Device activated", token });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
