'use client';
import React, { useEffect, useState } from 'react';

const defaultSettings = {
  gridType: '2',
  slideDirectionG1: 'left',
  slideDirectionG2: 'right',
  selectRatio: '1:1',
  imageDuration: 5,
  tickerEnabled: true,
  tickerText: 'Welcome to Signage!',
  tickerFontSize: 20,
  tickerFontFamily: 'Arial, sans-serif',
  tickerFontColor: '#ffffff',
  tickerBgColor: '#000000'
};

export default function Page() {
  const [deviceId, setDeviceId] = useState('');
  const [settings, setSettings] = useState(defaultSettings);
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState('');
  const [myDevices, setMyDevices] = useState([]);


  useEffect(() => {
  fetch("/api/auth/me")
    .then(r => r.json())
    .then(j => {
      if (!j.user) {
        window.location.href = "/admin/login";
      } else {
        setMe(j.user);
      }
    });
}, []);


  // ✅ Load device/global settings
  
 const loadDevices = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/admin/login";
    return;
  }

  const r = await fetch('/api/devices/list', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const j = await r.json();
  if (j.devices) setMyDevices(j.devices);
};


useEffect(() => { loadDevices(); }, []);


  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    const q = deviceId
      ? '/api/settings/get?deviceId=' + encodeURIComponent(deviceId)
      : '/api/settings/get';

    const r = await fetch(q, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const j = await r.json();
    if (j.settings) setSettings({ ...defaultSettings, ...j.settings });
  };

  useEffect(() => { if (deviceId) load(); }, [deviceId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  // ✅ Save device/global settings
 const save = async (applyGlobal = false) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/admin/login";
    return;
  }

  if (!applyGlobal && !deviceId) {
    setMsg("Please enter or select a device ID before saving.");
    return;
  }

  setMsg('Saving...');
  const res = await fetch('/api/settings/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ deviceId, settings, applyGlobal })
  });

  const j = await res.json();
  if (res.ok) {
    setMsg('Saved');
    setTimeout(() => setMsg(''), 1500);
  } else {
    setMsg('Error: ' + (j.error || 'failed'));
  }
};


  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <h2>CMS - Per-user / Per-device customization</h2>
      <div>Logged in as: {me ? me.email : '...'}</div>
      <div style={{ marginTop: 10 }}>
        <label>Device ID (leave empty for global): </label>
        <input
          value={deviceId}
          onChange={e => setDeviceId(e.target.value)}
          placeholder="dev-abc..."
        />
        <button onClick={load} style={{ marginLeft: 8 }}>Load</button>
       <button onClick={loadDevices} style={{ marginLeft: 8 }}>My Devices</button>

      </div>
    <div style={{ marginTop: 10 }}>
  <label>Or pick from your devices:</label>
  <select onChange={e => setDeviceId(e.target.value)} value={deviceId}>
    <option value=''>-- pick device --</option>
    {myDevices.map(d => (
      <option key={d._id} value={d.deviceId}>
        {d.deviceId}{d.owner ? ' (owner:' + d.owner + ')' : ''}
      </option>
    ))}
  </select>
</div>


    


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <div>
          <label>Grid Type</label>
          <select name="gridType" value={settings.gridType} onChange={handleChange}>
            <option value='1'>1 Grid</option>
            <option value='2'>2 Grid</option>
          </select>
        </div>
        <div>
          <label>Slide Direction (Grid 1)</label>
          <select name="slideDirectionG1" value={settings.slideDirectionG1} onChange={handleChange}>
            <option>left</option>
            <option>right</option>
            <option>up</option>
            <option>down</option>
          </select>
        </div>
        <div>
          <label>Slide Direction (Grid 2)</label>
          <select name="slideDirectionG2" value={settings.slideDirectionG2} onChange={handleChange}>
            <option>left</option>
            <option>right</option>
            <option>up</option>
            <option>down</option>
          </select>
        </div>
        <div>
          <label>Select Ratio</label>
          <select name="selectRatio" value={settings.selectRatio} onChange={handleChange}>
          <option>1:1</option>
      <option>1:2</option>
      <option>2:1</option>
      <option>1:3</option>
      <option>3:1</option>
      <option>Custom</option>
          </select>
        </div>
        <div>
          <label>Slide Duration (sec)</label>
          <input type="number" name="imageDuration" value={settings.imageDuration} onChange={handleChange} />
        </div>
        <div>
          <label>
            <input type="checkbox" name="tickerEnabled" checked={settings.tickerEnabled} onChange={handleChange} /> Ticker Enabled
          </label>
        </div>
        <div>
          <label>Ticker Text</label>
          <input name="tickerText" value={settings.tickerText} onChange={handleChange} />
        </div>
        <div>
          <label>Font Size</label>
          <input type="number" name="tickerFontSize" value={settings.tickerFontSize} onChange={handleChange} />
        </div>
        <div>
          <label>Font Family</label>
          <input name="tickerFontFamily" value={settings.tickerFontFamily} onChange={handleChange} />
        </div>
        <div>
          <label>Font Color</label>
          <input type="color" name="tickerFontColor" value={settings.tickerFontColor} onChange={handleChange} />
        </div>
        <div>
          <label>Background Color</label>
          <input type="color" name="tickerBgColor" value={settings.tickerBgColor} onChange={handleChange} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => save(false)}>Apply & Close (device)</button>
        <button onClick={() => save(true)} style={{ marginLeft: 8 }}>Apply as Global</button>
        <span style={{ marginLeft: 12 }}>{msg}</span>
      </div>
    </div>
  );
}
