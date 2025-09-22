import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const COOKIE_NAME = 'signage_auth';

export async function POST(req){
  try{
    const body = await req.json();
    const { email, password } = body;
    if(!email || !password) return new Response(JSON.stringify({error:'email and password required'}),{status:400});

    const client=await clientPromise;
    const db=client.db('signage');
    const users=db.collection('users');
    const user=await users.findOne({email});
    if(!user) return new Response(JSON.stringify({error:'invalid credentials'}),{status:401});

    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return new Response(JSON.stringify({error:'invalid credentials'}),{status:401});

    const token = jwt.sign({sub: user._id.toString(), email: user.email, role: user.role}, JWT_SECRET, {expiresIn: '7d'});
    // cookie options suitable for localhost development
    const cookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: 60*60*24*7,
      sameSite: 'lax'   // lax is good for local dev
      // secure: true     // don't enable in dev on plain http
    });

    return new Response(JSON.stringify({user:{email:user.email,role:user.role}}),{
      status:200,
      headers:{
        'Set-Cookie': cookie,
        'Content-Type':'application/json'
      }
    });
  }catch(e){ return new Response(JSON.stringify({error:e.message}),{status:500});}
}
