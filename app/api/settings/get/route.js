
import clientPromise from '@/lib/mongodb';
export async function GET(req){
  try{
    const url=new URL(req.url);
    const deviceId = url.searchParams.get('deviceId');
    const client = await clientPromise;
    const db = client.db('signage');
    const coll = db.collection('settings');
    const globalDoc = await coll.findOne({scope:'global'}) || {};
    if(deviceId){
      const dev = await coll.findOne({deviceId});
      const merged = {...globalDoc, ...dev};
      return new Response(JSON.stringify({settings:merged}),{status:200});
    }
    return new Response(JSON.stringify({settings:globalDoc}),{status:200});
  }catch(e){ return new Response(JSON.stringify({error:e.message}),{status:500});}
}
