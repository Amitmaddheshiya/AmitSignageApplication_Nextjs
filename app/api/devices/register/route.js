import clientPromise from '@/lib/mongodb';

export async function POST(req){
  try{
    const body = await req.json();
    const deviceId = body.deviceId;
    if(!deviceId) return new Response(JSON.stringify({error:"deviceId required"}),{status:400});
    const client = await clientPromise;
    const db = client.db('signage');
    const devices = db.collection('devices');
    // generate activation key
    const activationKey = (Math.random().toString(36).slice(2,10)).toUpperCase();
    const doc = {
      deviceId,
      activationKey,
      active: false,
      createdAt: new Date(),
      lastSeen: new Date(),
      meta: body.meta||{}
    };
    await devices.updateOne({deviceId},{$setOnInsert:doc},{upsert:true});
    const existing = await devices.findOne({deviceId});
    return new Response(JSON.stringify({device:existing}),{status:200});
  }catch(e){
    return new Response(JSON.stringify({error:e.message}),{status:500});
  }
}
