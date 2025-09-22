
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcrypt';

export async function POST(req){
  try{
    const body = await req.json();
    const { email, password, role, secret } = body;
    if(!email || !password) return new Response(JSON.stringify({error:'email & password required'}),{status:400});

  
    const client = await clientPromise;
    const users = client.db('signage').collection('users');
    const existing = await users.findOne({email});
    if(existing) return new Response(JSON.stringify({error:'user exists'}),{status:400});
    const hash = await bcrypt.hash(password, 10);
    const doc = { email, passwordHash: hash, role: role||'user', createdAt: new Date() };
    await users.insertOne(doc);
    return new Response(JSON.stringify({ok:true}),{status:200});
  }catch(e){ return new Response(JSON.stringify({error:e.message}),{status:500});}
}
