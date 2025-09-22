import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("signage");

    // ✅ Role filter hata diya (admin + user dono login kar paenge)
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "No password set for this user" }, { status: 500 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT_SECRET not set" }, { status: 500 });
    }

    // ✅ role include kiya JWT me
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret,
      { expiresIn: "7d" }
    );

    const body = { token, user: { email: user.email, role: user.role } };
    const res = NextResponse.json(body);
    res.headers.set(
      "Set-Cookie",
      `signage_auth=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
