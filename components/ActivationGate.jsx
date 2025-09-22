'use client';
import React, {useEffect, useState} from 'react';
import SignageBoard from './SignageBoard';

function simpleHash(s){
  let h=0;
  for(let i=0;i<s.length;i++){h=(h*31 + s.charCodeAt(i))|0;}
  return Math.abs(h).toString(36);
}

export default function ActivationGate(){
  const [status, setStatus] = useState({loading:true});
  const [device, setDevice] = useState(null);
  useEffect(()=>{
    (async ()=>{
      try{
        let deviceId = localStorage.getItem('signage_device_id');
        if(!deviceId){
          // generate deterministic-ish id from userAgent+platform
          const seed = navigator.userAgent + '|' + navigator.platform + '|' + navigator.vendor + '|' + screen.width + 'x' + screen.height;
          deviceId = 'dev-' + simpleHash(seed + Date.now().toString().slice(-4));
          localStorage.setItem('signage_device_id', deviceId);
        }
        // check device
        const q = await fetch('/api/devices/check?deviceId='+encodeURIComponent(deviceId));
        const j = await q.json();
        if(j.device){
          setDevice(j.device);
          setStatus({loading:false, active: !!j.device.active});
        }else{
          // register
          const reg = await fetch('/api/devices/register', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({deviceId, meta:{ua:navigator.userAgent}})
          });
          const rj = await reg.json();
          setDevice(rj.device);
          setStatus({loading:false, active: !!(rj.device && rj.device.active)});
        }
      }catch(e){
        console.error(e);
        setStatus({loading:false, error: e.message});
      }
    })();
  },[]);

  if(status.loading) return <div style={{padding:20}}>Checking activation...</div>;
  if(status.error) return <div style={{padding:20,color:'red'}}>Error: {status.error}</div>;
  if(status.active) return <SignageBoard deviceId={localStorage.getItem('signage_device_id')} />;

  // inactive -> show activation code page
  const activationKey = device?.activationKey || '—';
  return (
    <div style={{position:'relative',minHeight:'100vh'}}>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#000a',color:'#fff',zIndex:9000}}>
        <div style={{background:'#fff',color:'#000',padding:20,borderRadius:8,maxWidth:600,width:'90%'}}>
          <h2 style={{marginTop:0}}>Activation required</h2>
          <p>This device is not activated. Show this activation code in your admin panel to activate the device.</p>
          <p><strong>Device ID:</strong> {localStorage.getItem('signage_device_id')}</p>
          <p><strong>Activation key:</strong> <code style={{fontSize:18,letterSpacing:2}}>{activationKey}</code></p>
          <p>
  After activating from admin (POST /api/admin/activate with JSON {`{ "activationKey": "CODE" }`}), refresh this page.
</p>

        </div>
      </div>
      {/* keep SignageBoard rendered beneath for when active (hidden) */}
      <div style={{filter:'blur(2px)',pointerEvents:'none',opacity:0.5}}>
        <SignageBoard />
      </div>
    </div>
  );
}
