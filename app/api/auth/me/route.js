import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export async function GET(req) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const m = cookie.match(/signage_auth=([^;]+)/);
    if (!m) return new Response(JSON.stringify({ user: null }), { status: 200 });

    const token = m[1];
    const data = jwt.verify(token, JWT_SECRET);

// token may use `sub` for id (login sets sub)
const id = data.id || data.sub;
if (!id) return new Response(JSON.stringify({ user: null }), { status: 200 });

const client = await clientPromise;
const users = client.db('signage').collection('users');

const u = await users.findOne({ _id: new ObjectId(id) });

if (!u) return new Response(JSON.stringify({ user: null }), { status: 200 });

// include id in response so frontend can use it
return new Response(
  JSON.stringify({ user: { id: id, email: u.email, role: u.role } }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);
  } catch (e) {
    console.error("auth/me error:", e);
    return new Response(JSON.stringify({ user: null }), { status: 200 });
  }
}
