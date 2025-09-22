import clientPromise from '@/lib/mongodb';

export async function GET(req){
  try{
    const url = new URL(req.url);
    const deviceId = url.searchParams.get('deviceId');
    if(!deviceId) return new Response(JSON.stringify({error:"deviceId required"}),{status:400});
    const client = await clientPromise;
    const db = client.db('signage');
    const devices = db.collection('devices');
    const existing = await devices.findOne({deviceId});
    return new Response(JSON.stringify({device:existing}),{status:200});
  }catch(e){
    return new Response(JSON.stringify({error:e.message}),{status:500});
  }
}
