"use client";
import React, { useState, useEffect } from "react";
import { saveSettings } from "../lib/storage";

export default function SidePanel({ settings, onClose, onChange }) {
  const [local, setLocal] = useState(settings || {});

  useEffect(() => setLocal(settings || {}), [settings]);

  const apply = async () => {
    try {
      // ✅ Local update
      onChange(local);
      await saveSettings(local);

      // ✅ Server update
      const token = localStorage.getItem("token");
      await fetch("/api/settings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          deviceId: localStorage.getItem("signage_device_id") || "",
          settings: local,
          applyGlobal: false,
        }),
      });
    } catch (err) {
      console.error("Failed to save settings to server", err);
    }

    onClose();
  };

  return (
    <div className="side-panel" role="dialog" aria-modal="true">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Customization</h3>
        <button className="btn" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="controls" style={{ marginTop: 12 }}>
        <label>
          Grid Type
          <select
            value={local.gridType}
            onChange={(e) => setLocal({ ...local, gridType: e.target.value })}
          >
            <option value="2">2 Grid</option>
            <option value="1">1 Grid</option>
          </select>
        </label>

        {/* 🆕 Orientation */}
        <label>
          Orientation
          <select
            value={local.orientation || "horizontal"}
            onChange={(e) => setLocal({ ...local, orientation: e.target.value })}
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>

        {/* 🆕 Rotation */}
        <label>
          Rotation
          <select
            value={local.rotation || "0"}
            onChange={(e) => setLocal({ ...local, rotation: e.target.value })}
          >
            <option value="0">0°</option>
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
          </select>
        </label>

        <label>
          Slide Direction (Grid 1)
          <select
            value={local.slideDirectionG1}
            onChange={(e) => setLocal({ ...local, slideDirectionG1: e.target.value })}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
          </select>
        </label>

        <label>
          Slide Direction (Grid 2)
          <select
            value={local.slideDirectionG2}
            onChange={(e) => setLocal({ ...local, slideDirectionG2: e.target.value })}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
          </select>
        </label>

        {local.gridType === "2" && (
          <label>
            Select Ratio
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
          </label>
        )}

        <label>
          Slide Duration (sec for images)
          <input
            type="number"
            value={local.imageDuration}
            onChange={(e) => setLocal({ ...local, imageDuration: Number(e.target.value) })}
          />
        </label>

        <label>
          Ticker Enabled
          <input
            type="checkbox"
            checked={local.tickerEnabled}
            onChange={(e) => setLocal({ ...local, tickerEnabled: e.target.checked })}
          />
        </label>

        <label>
          Ticker Text
          <input
            value={local.tickerText}
            onChange={(e) => setLocal({ ...local, tickerText: e.target.value })}
          />
        </label>

        <label>
          Font Size
          <input
            type="number"
            value={local.tickerFontSize}
            onChange={(e) =>
              setLocal({ ...local, tickerFontSize: Number(e.target.value) })
            }
          />
        </label>

        <label>
          Font Family
          <input
            value={local.tickerFontFamily}
            onChange={(e) => setLocal({ ...local, tickerFontFamily: e.target.value })}
          />
        </label>

        <label>
          Font Color
          <input
            type="color"
            value={local.tickerFontColor}
            onChange={(e) => setLocal({ ...local, tickerFontColor: e.target.value })}
          />
        </label>

        <label>
          Background Color
          <input
            type="color"
            value={local.tickerBgColor}
            onChange={(e) => setLocal({ ...local, tickerBgColor: e.target.value })}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={apply}>
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
