
import { serialize } from 'cookie';
export async function POST(req){
  const cookie = serialize('signage_auth','', {httpOnly:true, path:'/', maxAge:0});
  return new Response(JSON.stringify({ok:true}),{status:200, headers:{'Set-Cookie':cookie,'Content-Type':'application/json'}});
}
