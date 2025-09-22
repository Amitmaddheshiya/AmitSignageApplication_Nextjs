import clientPromise from '@/lib/mongodb';

export async function POST(req){
  try{
    const body = await req.json();
    const activationKey = body.activationKey;
    if(!activationKey) return new Response(JSON.stringify({error:"activationKey required"}),{status:400});
    const client = await clientPromise;
    const db = client.db('signage');
    const devices = db.collection('devices');
    const res = await devices.updateOne({activationKey},{$set:{active:true, activatedAt:new Date()}});
    return new Response(JSON.stringify({matched:res.matchedCount, modified:res.modifiedCount}),{status:200});
  }catch(e){
    return new Response(JSON.stringify({error:e.message}),{status:500});
  }
}
