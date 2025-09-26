"use client";
import React, { useState, useRef, useEffect } from "react";
import { saveMedia, loadMedia, clearMedia } from "../lib/storage";

export default function GridCell({ id, media = [], onReplace, settings }) {
  const [items, setItems] = useState(media || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animateKey, setAnimateKey] = useState(0);
  const [slideClass, setSlideClass] = useState("");
  const [videoReady, setVideoReady] = useState(true);
  const [inputKey, setInputKey] = useState(0);

  const inputRef = useRef();
  const videoRef = useRef();
  const timerRef = useRef();
  const nextVideoRef = useRef(); // 🔹 preloading next video

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

  // autoplay for images
  useEffect(() => {
    if (items.length === 0) return;
    const curr = items[currentIndex];
    if (curr.type === "image") {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCurrentIndex((i) => {
          const next = (i + 1) % items.length;
          setAnimateKey(Date.now());
          setVideoReady(true); // reset for next media
          return next;
        });
      }, (settings?.imageDuration || 5) * 1000);
    }
  }, [currentIndex, items, settings]);

  // slide animation trigger
  useEffect(() => {
    if (items.length === 0) return;
    setSlideClass(`slide-enter slide-${settings?.slideDirection}`);
    requestAnimationFrame(() => {
      setSlideClass(
        `slide-enter slide-${settings?.slideDirection} slide-enter-active`
      );
    });
  }, [currentIndex, settings?.slideDirection]);

  // handle file input
  const handleInput = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const limitedFiles = files.slice(0, 5);
    const toSave = [];
    const created = [];

    for (const f of limitedFiles) {
      const idf = Date.now() + "-" + f.name;
      toSave.push({ id: idf, name: f.name, type: f.type, blob: f });
      created.push({
        id: idf,
        type: f.type.startsWith("image") ? "image" : "video",
        name: f.name,
        url: URL.createObjectURL(f),
      });
    }

    await clearMedia(id);
    await saveMedia(id, toSave);
    setItems(created);
    setCurrentIndex(0);
    onReplace && onReplace(created);

    // 🔹 Force input remount
    setInputKey((k) => k + 1);
    setVideoReady(true);
  };

  const openPicker = () => inputRef.current?.click();

  // handle video end
  const onVideoEnded = () => {
    setCurrentIndex((i) => {
      const next = (i + 1) % items.length;
      setAnimateKey(Date.now());
      setVideoReady(false); // prepare loading indicator for next video
      return next;
    });
  };

  // pre-load next video for smooth slide
  useEffect(() => {
    if (items.length === 0) return;
    const nextIndex = (currentIndex + 1) % items.length;
    if (items[nextIndex].type === "video") {
      const vid = document.createElement("video");
      vid.src = items[nextIndex].url;
      vid.preload = "auto";
      vid.muted = true;
      nextVideoRef.current = vid;
    }
  }, [currentIndex, items]);

  const onVideoLoaded = () => {
    setVideoReady(true);
  };

  return (
    <div
      className="cell"
      onClick={openPicker}
      style={{ cursor: "pointer", position: "relative", overflow: "hidden" }}
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
        className="media-grid"
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
              pointerEvents: "none",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            {items[currentIndex].type === "image" ? (
              <img
                src={items[currentIndex].url}
                alt={items[currentIndex].name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                  backfaceVisibility: "hidden",
                  willChange: "transform",
                }}
              />
            ) : (
              <>
                {!videoReady && (
                  <div
                    style={{
                      position: "absolute",
                      width: "50px",
                      height: "50px",
                      border: "4px solid white",
                      borderTop: "4px solid gray",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      zIndex: 10,
                    }}
                  />
                )}
                <video
                  ref={videoRef}
                  src={items[currentIndex].url}
                  autoPlay
                  playsInline
                  muted
                  onEnded={onVideoEnded}
                  onCanPlayThrough={onVideoLoaded}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                    backfaceVisibility: "hidden",
                    willChange: "transform",
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* 🔹 spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}
