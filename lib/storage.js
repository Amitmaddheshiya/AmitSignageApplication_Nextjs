// lib/storage.js
// Simple IndexedDB wrapper to store blobs (media) and settings.
const DB_NAME = 'signage-db';
const DB_VERSION = 1;
const FILE_STORE = 'files'; // stores blobs with key = gridId + '::' + fileId
const META_STORE = 'meta';  // stores metadata like settings and playlist order

function openDB(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if(!db.objectStoreNames.contains(FILE_STORE)){
        db.createObjectStore(FILE_STORE);
      }
      if(!db.objectStoreNames.contains(META_STORE)){
        db.createObjectStore(META_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMedia(gridId, files){
  // files: array of {id, name, type, blob}
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction([FILE_STORE, META_STORE], 'readwrite');
    const fStore = tx.objectStore(FILE_STORE);
    const mStore = tx.objectStore(META_STORE);
    const keys = [];
    for(const f of files){
      const key = gridId + '::' + f.id;
      fStore.put(f.blob, key);
      mStore.put({ id: f.id, name: f.name, type: f.type }, gridId + '::meta::' + f.id);
      keys.push(key);
    }
    // also store an index list for this grid
    mStore.put({ order: files.map(f=>f.id) }, gridId + '::order');
    tx.oncomplete = ()=> resolve(true);
    tx.onerror = ()=> reject(tx.error);
  });
}

export async function loadMedia(gridId){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction([FILE_STORE, META_STORE], 'readonly');
    const fStore = tx.objectStore(FILE_STORE);
    const mStore = tx.objectStore(META_STORE);
    const orderReq = mStore.get(gridId + '::order');
    orderReq.onsuccess = async () => {
      const order = (orderReq.result && orderReq.result.order) || [];
      const results = [];
      if(order.length === 0){
        resolve(results);
        return;
      }
      let pending = order.length;
      for(const id of order){
        const metaKey = gridId + '::meta::' + id;
        const metaReq = mStore.get(metaKey);
        metaReq.onsuccess = () => {
          const meta = metaReq.result;
          const fileKey = gridId + '::' + id;
          const fileReq = fStore.get(fileKey);
          fileReq.onsuccess = () => {
            const blob = fileReq.result;
            if(blob){
              results.push({ id, name: meta?.name || id, type: meta?.type || 'unknown', blob });
            }
            pending -= 1;
            if(pending === 0) resolve(results);
          };
          fileReq.onerror = () => { pending -= 1; if(pending === 0) resolve(results); };
        };
        metaReq.onerror = () => { pending -= 1; if(pending === 0) resolve(results); };
      }
    };
    orderReq.onerror = ()=> resolve([]);
  });
}

export async function clearMedia(gridId){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction([FILE_STORE, META_STORE], 'readwrite');
    const fStore = tx.objectStore(FILE_STORE);
    const mStore = tx.objectStore(META_STORE);
    const orderReq = mStore.get(gridId + '::order');
    orderReq.onsuccess = () => {
      const order = (orderReq.result && orderReq.result.order) || [];
      for(const id of order){
        fStore.delete(gridId + '::' + id);
        mStore.delete(gridId + '::meta::' + id);
      }
      mStore.delete(gridId + '::order');
      tx.oncomplete = ()=> resolve(true);
      tx.onerror = ()=> reject(tx.error);
    };
    orderReq.onerror = ()=> resolve(true);
  });
}

export async function saveSettings(deviceId, settings){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction([META_STORE], 'readwrite');
    const mStore = tx.objectStore(META_STORE);
    const key = `settings::${deviceId}`; // ✅ per device key
    mStore.put(settings, key);
    tx.oncomplete = ()=> resolve(true);
    tx.onerror = ()=> reject(tx.error);
  });
}

export async function loadSettings(deviceId){
  const db = await openDB();
  return new Promise((resolve, reject)=>{
    const tx = db.transaction([META_STORE], 'readonly');
    const mStore = tx.objectStore(META_STORE);
    const key = `settings::${deviceId}`; // ✅ per device key
    const req = mStore.get(key);
    req.onsuccess = ()=> resolve(req.result || null);
    req.onerror = ()=> resolve(null);
  });
}

