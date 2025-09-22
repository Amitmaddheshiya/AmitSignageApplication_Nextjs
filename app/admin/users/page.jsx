
'use client';
import React, {useEffect, useState} from 'react';

export default function Page(){
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignDeviceId, setAssignDeviceId] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const load = async () => {
    const r1 = await fetch('/api/admin/users/list', { headers: { 'Content-Type':'application/json' }});
    const j1 = await r1.json();
    if(j1.users) setUsers(j1.users);

    const r2 = await fetch('/api/devices/list', { headers: { 'Content-Type':'application/json', Authorization: token ? 'Bearer '+token : '' }});
    const j2 = await r2.json();
    if(j2.devices) setDevices(j2.devices);
  };

  useEffect(()=>{ load(); },[]);

  const createUser = async () => {
    if(!email || !password) return alert('email & password required');
    const r = await fetch('/api/admin/create-user', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password, role: 'user', secret: '' })
    });
    const j = await r.json();
    if(j.ok){ setEmail(''); setPassword(''); load(); } else alert(j.error||'error');
  };

  const assignDevice = async () => {
    if(!selectedUser) return alert('select user');
    if(!assignDeviceId) return alert('select device id');
    const r = await fetch('/api/devices/assign', {
      method:'POST', headers:{'Content-Type':'application/json', Authorization: token ? 'Bearer '+token : ''},
      body: JSON.stringify({ deviceId: assignDeviceId, owner: selectedUser.email })
    });
    const j = await r.json();
    if(j.ok){ alert('assigned'); setAssignDeviceId(''); load(); } else alert(j.error||'error');
  };

  return (
    <div style={{maxWidth:900, margin:'20px auto'}}>
      <h2>Users - Create & Assign Devices</h2>

      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <h3>Create user</h3>
          <input placeholder='email' value={email} onChange={e=>setEmail(e.target.value)} />
          <br/>
          <input placeholder='password' value={password} onChange={e=>setPassword(e.target.value)} />
          <br/>
          <button onClick={createUser}>Create</button>
        </div>

        <div style={{flex:1}}>
          <h3>Assign device</h3>
          <label>Select user</label>
          <select onChange={e=>{ const u=users.find(x=>x._id===e.target.value); setSelectedUser(u); }}>
            <option value=''>-- select --</option>
            {users.map(u=> <option key={u._id} value={u._id}>{u.email}</option>)}
          </select>
          <br/>
          <label>Select device</label>
          <select value={assignDeviceId} onChange={e=>setAssignDeviceId(e.target.value)}>
            <option value=''>-- select device --</option>
            {devices.map(d=> <option key={d._id} value={d.deviceId}>{d.deviceId} {d.owner? '(owner:'+d.owner+')':''}</option>)}
          </select>
          <br/>
          <button onClick={assignDevice}>Assign</button>
        </div>
      </div>

      <hr/>
      <h3>Existing users</h3>
      <table border={1} cellPadding={6}>
        <thead><tr><th>Email</th><th>Role</th><th>Created</th></tr></thead>
        <tbody>
          {users.map(u=> <tr key={u._id}><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleString()}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
