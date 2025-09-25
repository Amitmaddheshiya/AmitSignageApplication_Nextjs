
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

async function getUserFromReq(req){
  try {
    const auth = req.headers.get('authorization')||'';
    const mAuth = auth.match(/Bearer\s+(.+)/i);
    if(mAuth){
      try{ return jwt.verify(mAuth[1], JWT_SECRET); }catch(e){}
    }

    const cookie = req.headers.get('cookie')||'';
    const m = cookie.match(/signage_auth=([^;]+)/);
    if(!m) return null;
    const token = m[1];
    return jwt.verify(token, JWT_SECRET);
  }catch(e){ return null; }
}


export async function POST(req){
  try{
    const user = await getUserFromReq(req);
    if(!user) return new Response(JSON.stringify({error:'unauthenticated'}),{status:401});
    const body = await req.json();
    const { deviceId, settings, applyGlobal } = body;
    const client = await clientPromise;
    const db = client.db('signage');
    const coll = db.collection('settings');
    if(applyGlobal){
     await coll.updateOne(
  { deviceId }, // filter by deviceId
  {
    $set: {
      ...settings,
      deviceId,
      owner: user.email,
      updatedAt: new Date(),
    },
  },
  { upsert: true } // ✅ will update if exists, insert if not
);

    }
    if(!deviceId) return new Response(JSON.stringify({error:'deviceId required'}),{status:400});
    const devices = db.collection('devices');
    const dev = await devices.findOne({deviceId});
    if(dev && dev.owner && dev.owner !== user.email){
      return new Response(JSON.stringify({error:'not owner of device'}),{status:403});
    }
    // claim device if no owner
    if(dev && !dev.owner){
      await (db.collection('devices')).updateOne({deviceId},{$set:{owner:user.email}},{upsert:false});
    }
   await coll.updateOne(
  {deviceId},
  {$set: {...settings, deviceId, owner:user.email, updatedAt:new Date()}},
  {upsert:true}
);

    const saved = await coll.findOne({deviceId});
    return new Response(JSON.stringify({ok:true, settings:saved}),{status:200, headers:{'Content-Type':'application/json'}});
  }catch(e){ return new Response(JSON.stringify({error:e.message}),{status:500});}
}
