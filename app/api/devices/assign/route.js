
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function getUser(req){
  try{
    // 1) Bearer token in Authorization header
    const auth = req.headers.get('authorization')||'';
    const mAuth = auth.match(/Bearer\s+(.+)/i);
    if(mAuth){
      try{ return jwt.verify(mAuth[1], JWT_SECRET); }catch(e){}
    }
    // 2) Cookie 'signage_auth'
    const c = req.headers.get('cookie')||'';
    const m = c.match(/signage_auth=([^;]+)/);
    if(m){
      try{ return jwt.verify(m[1], JWT_SECRET); }catch(e){}
    }
    return null;
  }catch(e){ return null; }
}

export async function POST(req){
  try{
    const user = getUser(req);
    if(!user) return new Response(JSON.stringify({error:'unauthenticated'}),{status:401});
    if(user.role !== 'admin') return new Response(JSON.stringify({error:'forbidden'}),{status:403});
    const body = await req.json();
    const { deviceId, owner } = body;
    if(!deviceId || !owner) return new Response(JSON.stringify({error:'deviceId and owner required'}),{status:400});
    const client = await clientPromise;
    const db = client.db('signage');
    const devices = db.collection('devices');
    await devices.updateOne({deviceId},{$set:{owner}},{upsert:true});
    return new Response(JSON.stringify({ok:true}),{status:200, headers:{'Content-Type':'application/json'}});
  }catch(e){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}
