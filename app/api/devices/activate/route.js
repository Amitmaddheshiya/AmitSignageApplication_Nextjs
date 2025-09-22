import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { deviceId, activationKey } = await req.json();
    if (!deviceId || !activationKey) {
      return NextResponse.json({ error: "Missing deviceId or activationKey" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("signage");

    const device = await db.collection("devices").findOne({ deviceId });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }
    if (device.activationKey !== activationKey) {
      return NextResponse.json({ error: "Invalid activation key" }, { status: 401 });
    }

    await db.collection("devices").updateOne(
      { deviceId },
      { $set: { active: true } }
    );

    return NextResponse.json({ message: "Device activated successfully" });
  } catch (err) {
    console.error("Activate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
