import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function getUser(req){
  try{
    const c = req.headers.get('cookie')||'';
    const m = c.match(/signage_auth=([^;]+)/);
    if(!m) return null;
    try{ return jwt.verify(m[1], JWT_SECRET); }catch(e){ return null; }
  }catch(e){ return null; }
}

export async function GET(req){
  try{
    const user = getUser(req);
    if(!user) return new Response(JSON.stringify({error:'unauthenticated'}),{status:401});
    if(user.role !== 'admin') return new Response(JSON.stringify({error:'forbidden'}),{status:403});
    const client = await clientPromise;
    const users = await client.db('signage').collection('users').find({}).project({passwordHash:0}).toArray();
    return new Response(JSON.stringify({users}),{status:200, headers:{'Content-Type':'application/json'}});
  }catch(e){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}
