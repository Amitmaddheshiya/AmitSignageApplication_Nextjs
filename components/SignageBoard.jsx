"use client";
import React, { useState, useEffect } from "react";
import GridCell from "./GridCell";
import SidePanel from "./SidePanel";
import { loadSettings, saveSettings, loadMedia } from "../lib/storage";
import { Settings } from "lucide-react"; // 👈 icon

// Helper: DB se token fetch
async function fetchTokenFromDB(deviceId) {
  try {
    const res = await fetch(`/api/devices/getToken?deviceId=${encodeURIComponent(deviceId)}`);
    const data = await res.json();
    if (res.ok && data.token) return data.token;
    console.error("Token fetch failed:", data.error);
    return null;
  } catch (err) {
    console.error("Token fetch error:", err);
    return null;
  }
}

export default function SignageBoard({ deviceId }) {
  const [grids, setGrids] = useState({ g1: [], g2: [] });
  const [settings, setSettings] = useState({
    gridType: "2",
    slideDirection: "left",
    selectRatio: "16:9",
    imageDuration: 5,
    tickerEnabled: true,
    tickerText: "Welcome to Signage!",
    tickerFontSize: 20,
    tickerFontFamily: "Arial, sans-serif",
    tickerFontColor: "#ffffff",
    tickerBgColor: "#000000",
    orientation: "horizontal",
    rotation: 0,
    slideDirectionG1: "left",
    slideDirectionG2: "right",
  });
  const [showPanel, setShowPanel] = useState(false);

  // Load saved media and settings
  useEffect(() => {
    (async () => {
      const s = await loadSettings(deviceId);
      if (s) setSettings((prev) => ({ ...prev, ...s }));

      const g1 = await loadMedia("g1");
      const g2 = await loadMedia("g2");

      if (g1 && g1.length) {
        setGrids((prev) => ({
          ...prev,
          g1: g1.map((item) => ({
            id: item.id,
            type: item.type.startsWith("image") ? "image" : "video",
            name: item.name,
            url: URL.createObjectURL(item.blob),
          })),
        }));
      }
      if (g2 && g2.length) {
        setGrids((prev) => ({
          ...prev,
          g2: g2.map((item) => ({
            id: item.id,
            type: item.type.startsWith("image") ? "image" : "video",
            name: item.name,
            url: URL.createObjectURL(item.blob),
          })),
        }));
      }
    })();
  }, [deviceId]);

  const handleUploadReplace = (gridId, items) => {
    setGrids((prev) => ({ ...prev, [gridId]: items }));
  };

  // Handle settings change
  const handleSettingsChange = async (s) => {
    const newSettings = { ...settings, ...s };
    setSettings(newSettings);

    try {
      await saveSettings(deviceId, newSettings);
      const token = await fetchTokenFromDB(deviceId);
      if (!token) throw new Error("No token available in DB");

      await fetch("/api/settings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deviceId,
          settings: newSettings,
          applyGlobal: false,
        }),
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  // Remote & right-click toggle for SidePanel
useEffect(() => {
  let lastPress = 0;

  const handleToggle = (e) => {
    const now = Date.now();

    // Check typing fields
    const activeEl = document.activeElement;
    const isTyping =
      activeEl &&
      (activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        activeEl.isContentEditable);
    if (isTyping) return;

    const isBackspace = e.key === "Backspace";
    const isContextMenu = e.type === "contextmenu";

    if (!isBackspace && !isContextMenu) return;

    e.preventDefault();

    // Double press/double click detection
    if (now - lastPress < 500) {
      lastPress = 0;
      if (isBackspace) window.history.back();
      return;
    }
    lastPress = now;
    setShowPanel((prev) => !prev);
  };

  // PC & Web
  window.addEventListener("keydown", handleToggle);
  window.addEventListener("contextmenu", handleToggle);

  // Touch / TV: long-press detection
  let touchTimer = null;
  const handleTouchStart = () => {
    touchTimer = setTimeout(() => setShowPanel((prev) => !prev), 800); // 0.8s long press
  };
  const handleTouchEnd = () => {
    if (touchTimer) clearTimeout(touchTimer);
  };
  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchend", handleTouchEnd);

  return () => {
    window.removeEventListener("keydown", handleToggle);
    window.removeEventListener("contextmenu", handleToggle);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
  };
}, []);

  return (
  <div
    style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column", // 👈 ऊपर grid, नीचे ticker
      overflow: "hidden",
      position: "relative",
    }}
  >
    {/* 🔹 Grids */}
    <div
      className="grid-wrap"
      style={{
        flex: 1, // 👈 बचे हुए space grid ले लेगा
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns:
          settings.orientation === "horizontal"
            ? settings.gridType === "2"
              ? settings.selectRatio === "1:2"
                ? "1fr 2fr"
                : settings.selectRatio === "2:1"
                ? "2fr 1fr"
                : "1fr 1fr"
              : "1fr"
            : "1fr",
        gridTemplateRows:
          settings.orientation === "vertical" && settings.gridType === "2"
            ? settings.selectRatio === "1:2"
              ? "1fr 2fr"
              : settings.selectRatio === "2:1"
              ? "2fr 1fr"
              : "1fr 1fr"
            : "1fr",
        transform: `rotate(${settings.rotation || 0}deg)`,
        transformOrigin: "center center",
      }}
    >
      <GridCell
        id="g1"
        media={grids.g1}
        onReplace={(items) => handleUploadReplace("g1", items)}
        settings={{ ...settings, slideDirection: settings.slideDirectionG1 }}
      />
      {settings.gridType === "2" && (
        <GridCell
          id="g2"
          media={grids.g2}
          onReplace={(items) => handleUploadReplace("g2", items)}
          settings={{ ...settings, slideDirection: settings.slideDirectionG2 }}
        />
      )}
    </div>

    {/* 🔹 Ticker */}
    {settings.tickerEnabled && (
      <div
        className="ticker"
        style={{
          minHeight: `${settings.tickerFontSize * 2}px`, // 👈 dynamic height
          background: settings.tickerBgColor,
          color: settings.tickerFontColor,
          fontFamily: settings.tickerFontFamily,
          fontSize: settings.tickerFontSize,
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          padding: "0 40px 0 10px",
        }}
      >
        <div className="marquee">
          {settings.tickerText} &nbsp; &nbsp; {settings.tickerText}
        </div>

        {/* settings icon */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)", // 👈 हमेशा center
            cursor: "pointer",
          }}
          onClick={() => setShowPanel(true)}
        >
          <Settings size={22} className="text-white" />
        </div>
      </div>
    )}

    {/* 🔹 SidePanel */}
    {showPanel && (
      <SidePanel
        settings={settings}
        onClose={() => setShowPanel(false)}
        onChange={(s) => handleSettingsChange(s)}
      />
    )}
  </div>
);

}
