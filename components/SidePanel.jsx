"use client";
import React, { useState, useEffect } from "react";
import { saveSettings } from "../lib/storage";

// Fetch token helper
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

export default function SidePanel({ settings, onClose, onChange }) {
  const [local, setLocal] = useState(settings || {});

  useEffect(() => {
    setLocal({
      gridType: settings.gridType || "2",
      slideDirectionG1: settings.slideDirectionG1 || "left",
      slideDirectionG2: settings.slideDirectionG2 || "right",
      selectRatio: settings.selectRatio || "16:9",
      imageDuration: settings.imageDuration ?? 5,
      tickerEnabled: settings.tickerEnabled ?? true,
      tickerText: settings.tickerText || "Welcome to Signage!",
      tickerFontSize: settings.tickerFontSize ?? 20,
      tickerFontFamily: settings.tickerFontFamily || "Arial, sans-serif",
      tickerFontColor: settings.tickerFontColor || "#ffffff",
      tickerBgColor: settings.tickerBgColor || "#000000",
      orientation: settings.orientation || "horizontal",
      rotation: settings.rotation || "0",
    });
  }, [settings]);

  const apply = async () => {
    try {
      const deviceId = localStorage.getItem("signage_device_id");
      if (!deviceId) throw new Error("Device ID missing");

      await saveSettings(deviceId, local);

      const token = await fetchTokenFromDB(deviceId);
      if (!token) throw new Error("No token available in DB");

      await fetch("/api/settings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId, settings: local, applyGlobal: false }),
      });

      onChange(local);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={{ margin: 0, color: "#007BFF" }}>🎨 Customization</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Scrollable Content */}
        <div style={styles.content}>
          {/* Grid & Layout Section */}
          <section style={styles.section}>
            <h4 style={styles.sectionTitle}>📐 Grid & Layout</h4>
            <div style={styles.formRow}>
              <label>Grid Type</label>
              <select
                value={local.gridType}
                onChange={(e) => setLocal({ ...local, gridType: e.target.value })}
              >
                <option value="2">2 Grid</option>
                <option value="1">1 Grid</option>
              </select>
            </div>

            <div style={styles.formRow}>
              <label>Orientation</label>
              <select
                value={local.orientation}
                onChange={(e) => setLocal({ ...local, orientation: e.target.value })}
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>

            <div style={styles.formRow}>
              <label>Rotation</label>
              <select
                value={local.rotation}
                onChange={(e) => setLocal({ ...local, rotation: e.target.value })}
              >
                <option value="0">0°</option>
                <option value="90">90°</option>
                <option value="180">180°</option>
                <option value="270">270°</option>
              </select>
            </div>
          </section>

          {/* Slide Settings */}
          <section style={styles.section}>
            <h4 style={styles.sectionTitle}>🖼 Slide Settings</h4>
            <div style={styles.formRow}>
              <label>Slide Direction (Grid 1)</label>
              <select
                value={local.slideDirectionG1}
                onChange={(e) => setLocal({ ...local, slideDirectionG1: e.target.value })}
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>

            <div style={styles.formRow}>
              <label>Slide Direction (Grid 2)</label>
              <select
                value={local.slideDirectionG2}
                onChange={(e) => setLocal({ ...local, slideDirectionG2: e.target.value })}
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>

            {local.gridType === "2" && (
              <div style={styles.formRow}>
                <label>Select Ratio</label>
                <select
                  value={local.selectRatio}
                  onChange={(e) => setLocal({ ...local, selectRatio: e.target.value })}
                >
                  <option>1:1</option>
                  <option>1:2</option>
                  <option>2:1</option>
                  <option>1:3</option>
                  <option>3:1</option>
                  <option>Custom</option>
                </select>
              </div>
            )}

            <div style={styles.formRow}>
              <label>Slide Duration (sec)</label>
              <input
                type="number"
                value={local.imageDuration}
                onChange={(e) => setLocal({ ...local, imageDuration: Number(e.target.value) })}
              />
            </div>
          </section>

          {/* Ticker Section */}
          <section style={styles.section}>
            <h4 style={styles.sectionTitle}>📝 Ticker Settings</h4>
            <div style={styles.formRow}>
              <label>
                <input
                  type="checkbox"
                  checked={local.tickerEnabled}
                  onChange={(e) => setLocal({ ...local, tickerEnabled: e.target.checked })}
                />
                Ticker Enabled
              </label>
            </div>

            <div style={styles.formRow}>
              <label>Ticker Text</label>
              <input
                value={local.tickerText}
                onChange={(e) => setLocal({ ...local, tickerText: e.target.value })}
              />
            </div>

            <div style={styles.formRow}>
              <label>Font Size</label>
              <input
                type="number"
                value={local.tickerFontSize}
                onChange={(e) => setLocal({ ...local, tickerFontSize: Number(e.target.value) })}
              />
            </div>

            <div style={styles.formRow}>
              <label>Font Family</label>
              <input
                value={local.tickerFontFamily}
                onChange={(e) => setLocal({ ...local, tickerFontFamily: e.target.value })}
              />
            </div>

            <div style={styles.formRow}>
              <label>Font Color</label>
              <input
                type="color"
                value={local.tickerFontColor}
                onChange={(e) => setLocal({ ...local, tickerFontColor: e.target.value })}
              />
            </div>

            <div style={styles.formRow}>
              <label>Background Color</label>
              <input
                type="color"
                value={local.tickerBgColor}
                onChange={(e) => setLocal({ ...local, tickerBgColor: e.target.value })}
              />
            </div>
          </section>
        </div>

        {/* Apply Button Always Visible */}
        <div style={styles.applyWrapper}>
          <button style={styles.applyBtn} onClick={apply}>
            ✅ Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "flex-start",
    zIndex: 1000,
  },
  panel: {
    background: "#fff",
    width: 380,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-4px 0 15px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    borderBottom: "2px solid #007BFF",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    color: "#007BFF",
  },
  content: {
    flex: 1,
    padding: "15px 20px",
    overflowY: "auto",
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1px solid #e0e0e0",
    
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 600,
    color: "#007BFF",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
  },
  applyWrapper: {
    padding: 15,
    borderTop: "1px solid #e0e0e0",
    background: "#f9f9f9",
  },
  applyBtn: {
    background: "#007BFF",
    color: "#fff",
    padding: "12px 20px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
    fontSize: 16,
  },
};
