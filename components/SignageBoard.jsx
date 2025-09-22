"use client";
import React, { useState, useEffect } from "react";
import GridCell from "./GridCell";
import SidePanel from "./SidePanel";
import { loadSettings, saveSettings, loadMedia } from "../lib/storage";

export default function SignageBoard({deviceId}) {
  const fetchSettingsFromServer = async (deviceIdParam) => {
    try {
      const q = deviceIdParam
        ? '/api/settings/get?deviceId=' + encodeURIComponent(deviceIdParam)
        : '/api/settings/get';
      const r = await fetch(q);
      const j = await r.json();
      return j.settings || null;
    } catch (e) {
      console.error('fetch settings', e);
      return null;
    }
  };

  const [grids, setGrids] = useState({ g1: [], g2: [] });
  const [settings, setSettings] = useState({
    gridType: "2", // "1" or "2"
    slideDirection: "left",
    selectRatio: "16:9",
    imageDuration: 5,
    tickerEnabled: true,
    tickerText: "Welcome to Signage!",
    tickerFontSize: 20,
    tickerFontFamily: "Arial, sans-serif",
    tickerFontColor: "#ffffff",
    tickerBgColor: "#000000",
  });
  const [showPanel, setShowPanel] = useState(false);

  useEffect(()=>{
    (async ()=>{
      try{
        const id = deviceId || (typeof window !== 'undefined' ? localStorage.getItem('signage_device_id') : null);
        if(id){ const sv = await fetchSettingsFromServer(id); if(sv) setSettings(prev=>({...prev,...sv})); }
        const iv = setInterval(async ()=>{
          const id2 = deviceId || (typeof window !== 'undefined' ? localStorage.getItem('signage_device_id') : null);
          if(id2){
            const ss = await fetchSettingsFromServer(id2);
            if(ss) setSettings(prev=>({...prev,...ss}));
          }
        }, 15000);
        return ()=>clearInterval(iv);
      }catch(e){console.error(e)}
    })();
  },[deviceId]);

  useEffect(()=>{
    const onContext = (e)=>{
      e.preventDefault();
      setShowPanel(true);
    };
    window.addEventListener('contextmenu', onContext);
    return ()=> window.removeEventListener('contextmenu', onContext);
  },[]);

  // Load saved settings and grids from IndexedDB on mount
  useEffect(()=>{
    (async ()=>{
      const s = await loadSettings();
      if(s) setSettings(prev => ({...prev, ...s}));
      const g1 = await loadMedia('g1');
      const g2 = await loadMedia('g2');
      if(g1 && g1.length) {
        setGrids(prev => ({...prev, g1: g1.map(item => ({ id: item.id, type: item.type.startsWith('image') ? 'image':'video', name: item.name, url: URL.createObjectURL(item.blob) }))}));
      }
      if(g2 && g2.length) {
        setGrids(prev => ({...prev, g2: g2.map(item => ({ id: item.id, type: item.type.startsWith('image') ? 'image':'video', name: item.name, url: URL.createObjectURL(item.blob) }))}));
      }
    })();
  },[]);

  const handleUploadReplace = (gridId, items) => {
    // items: array of {id, type, name, url}
    setGrids(prev => ({ ...prev, [gridId]: items }));
  };

  const handleSettingsChange = async (s) => {
    setSettings(prev => ({...prev, ...s}));
    await saveSettings({...settings, ...s});
  };

  return (
    <div  style={{width:'100vw', height:'100vh', position:'relative'}}>
      <div 
  className="grid-wrap" 
  style={{
    display: "grid",
    width: "100%",
    height: "100%",
    gridTemplateColumns: settings.gridType === "2" 
      ? (settings.selectRatio === "1:1" ? "1fr 1fr" :
         settings.selectRatio === "1:2" ? "1fr 2fr" :
         settings.selectRatio === "2:1" ? "2fr 1fr" :
         settings.selectRatio === "1:3" ? "1fr 3fr" :
         settings.selectRatio === "3:1" ? "3fr 1fr" :
         "1fr 1fr") 
      : "1fr"
  }}
>
  <GridCell 
    id="g1" 
    media={grids.g1} 
    onReplace={(items)=>handleUploadReplace('g1', items)} 
    settings={{...settings, slideDirection: settings.slideDirectionG1}} 
  />
  {settings.gridType === "2" && (
    <GridCell 
      id="g2" 
      media={grids.g2} 
      onReplace={(items)=>handleUploadReplace('g2', items)} 
      settings={{...settings, slideDirection: settings.slideDirectionG2}} 
    />
  )}
</div>


      {/* Ticker */}
      {settings.tickerEnabled && (
        <div className="ticker" style={{background: settings.tickerBgColor, color: settings.tickerFontColor, fontFamily: settings.tickerFontFamily, fontSize: settings.tickerFontSize}}>
          <div className="marquee">{settings.tickerText} &nbsp; &nbsp; {settings.tickerText}</div>
        </div>
      )}

      {/* Side Panel */}
      {showPanel && (
        <SidePanel
          settings={settings}
          onClose={()=>setShowPanel(false)}
          onChange={(s)=>handleSettingsChange(s)}
        />
      )}
    </div>
  );
}
