"use client";
import React, { useState, useRef, useEffect } from "react";
import { saveMedia, loadMedia, clearMedia } from "../lib/storage";

export default function GridCell({ id, media = [], onReplace, settings }) {
  const [items, setItems] = useState(media || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animateKey, setAnimateKey] = useState(0);
  const [slideClass, setSlideClass] = useState("");
  const inputRef = useRef();
  const videoRef = useRef();
  const timerRef = useRef();

  // Load saved media
  useEffect(() => {
    (async () => {
      if ((media && media.length) || items.length) return;
      const saved = await loadMedia(id);
      if (saved && saved.length) {
        const mapped = saved.map((item) => ({
          id: item.id,
          type: item.type.startsWith("image") ? "image" : "video",
          name: item.name,
          url: URL.createObjectURL(item.blob),
        }));
        setItems(mapped);
        onReplace && onReplace(mapped);
      }
    })();
  }, []);

  // external prop changes
  useEffect(() => {
    setItems(media || []);
    setCurrentIndex(0);
  }, [media]);

  // cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // autoplay
  useEffect(() => {
    if (items.length === 0) return;
    const curr = items[currentIndex];
    if (curr.type === "image") {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCurrentIndex((i) => {
          const next = (i + 1) % items.length;
          setAnimateKey(Date.now());
          return next;
        });
      }, (settings?.imageDuration || 5) * 1000);
    }
  }, [currentIndex, items, settings]);

  // slide animation trigger
  // slide animation trigger
useEffect(() => {
  if (items.length === 0) return;

  setSlideClass(`slide-enter slide-${settings?.slideDirection}`);

  // ✅ Small timeout for WebView/TV to register DOM update
  const t = setTimeout(() => {
    setSlideClass(
      `slide-enter slide-${settings?.slideDirection} slide-enter-active`
    );
  }, 30); // 30ms delay

  return () => clearTimeout(t);
}, [currentIndex, settings?.slideDirection]);


const [inputKey, setInputKey] = useState(0);

const handleInput = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  const limitedFiles = files.slice(0, 5);
  const toSave = [];
  const created = [];

  for (const f of limitedFiles) {
    const idf = Date.now() + "-" + f.name;
    const blobUrl = URL.createObjectURL(f);
    toSave.push({ id: idf, name: f.name, type: f.type, blob: f });
    created.push({
      id: idf,
      type: f.type.startsWith("image") ? "image" : "video",
      name: f.name,
      url: blobUrl,
    });
  }

  // ✅ पुराना objectURL free कर दो memory leak रोकने के लिए
  items.forEach((item) => {
    if (item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });

  await clearMedia(id);
  await saveMedia(id, toSave);
  setItems(created);
  setCurrentIndex(0);
  onReplace && onReplace(created);

  // 🔹 Force input remount (so upload काम करे बार-बार)
  setInputKey((k) => k + 1);
};




  const openPicker = () => inputRef.current?.click();

  const onVideoEnded = () => {
    setCurrentIndex((i) => {
      const next = (i + 1) % items.length;
      setAnimateKey(Date.now());
      return next;
    });
  };

  return (
    <div
      className="cell"
      onClick={openPicker} // 👈 अब सिर्फ पूरा grid clickable रहेगा
      style={{ cursor: "pointer", position: "relative", overflow: "hidden"}}
    >
      <input
  key={inputKey}
  ref={inputRef}
  className="uploader"
  type="file"
  accept="image/*,video/*"
  multiple
  onChange={handleInput}
  style={{ display: "none" }}
/>


      <div
        className="media-grid "
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {items.length === 0 && (
          <div style={{ color: "#777", textAlign: "center" }}>
            Click anywhere to upload images/videos
          </div>
        )}

        {items.length > 0 && (
          <div
            key={animateKey}
            className={slideClass}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
               pointerEvents: "none",        // 👈 mouse cursor won't block animation
    backfaceVisibility: "hidden", // 👈 fix rendering glitch
    willChange: "transform",      // 👈 GPU acceleration
            }}
          >
            {items[currentIndex].type === "image" ? (
              <img
                src={items[currentIndex].url}
                alt={items[currentIndex].name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  pointerEvents: "none",    // ✅ also on image
        backfaceVisibility: "hidden",
        willChange: "transform",
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={items[currentIndex].url}
                autoPlay
                playsInline
                muted
                onEnded={onVideoEnded}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  pointerEvents: "none",    // ✅ also on image
        backfaceVisibility: "hidden",
        willChange: "transform",
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
