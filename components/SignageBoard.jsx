"use client";
import React, { useState, useEffect } from "react";
import GridCell from "./GridCell";
import SidePanel from "./SidePanel";
import { loadSettings, saveSettings, loadMedia } from "../lib/storage";
import { Settings } from "lucide-react";

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
  const [grids, setGrids] = useState({ g1: [], g2: [], g3: [] });
  const [settings, setSettings] = useState({
    gridType: "2", // "1" | "2" | "3"
    gridLayout: "2+1", // only for 3 grids
    slideDirectionG1: "left",
    slideDirectionG2: "right",
    slideDirectionG3: "up",
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
  });

  const [showPanel, setShowPanel] = useState(false);
  const [dateString, setDateString] = useState("");

  // Auto-update date
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      setDateString(formatted);
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load saved settings & media
  useEffect(() => {
    (async () => {
      const s = await loadSettings(deviceId);
      if (s) setSettings((prev) => ({ ...prev, ...s }));

      const g1 = await loadMedia("g1");
      const g2 = await loadMedia("g2");
      const g3 = await loadMedia("g3");

      const mapItems = (arr) =>
        arr?.map((item) => ({
          id: item.id,
          type: item.type.startsWith("image") ? "image" : "video",
          name: item.name,
          url: URL.createObjectURL(item.blob),
        })) || [];

      setGrids({ g1: mapItems(g1), g2: mapItems(g2), g3: mapItems(g3) });
    })();
  }, [deviceId]);

  const handleUploadReplace = (gridId, items) =>
    setGrids((prev) => ({ ...prev, [gridId]: items }));

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
        body: JSON.stringify({ deviceId, settings: newSettings, applyGlobal: false }),
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  // Toggle SidePanel
  useEffect(() => {
    let lastPress = 0;
    const handleToggle = (e) => {
      const now = Date.now();
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
      if (now - lastPress < 500) {
        lastPress = 0;
        if (isBackspace) window.history.back();
        return;
      }
      lastPress = now;
      setShowPanel((prev) => !prev);
    };

    window.addEventListener("keydown", handleToggle);
    window.addEventListener("contextmenu", handleToggle);
    return () => {
      window.removeEventListener("keydown", handleToggle);
      window.removeEventListener("contextmenu", handleToggle);
    };
  }, []);

  // Dynamic Grid Styles
const getGridStyle = () => {
  if (settings.gridType === "3") {
    if (settings.orientation === "horizontal") {
      // 3 rows, 1 column → horizontal layout
      let rowSizes;
      switch (settings.selectRatio) {
        case "2:1:1":
          rowSizes = "2fr 1fr 1fr";
          break;
        case "1:2:1":
          rowSizes = "1fr 2fr 1fr";
          break;
        case "1:1:2":
          rowSizes = "1fr 1fr 2fr";
          break;
        default:
          rowSizes = "1fr 1fr 1fr"; // "1:1:1"
      }

      return {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: rowSizes,
        width: "100%",
        height: "100%",
      };
    } else {
      // 1 row, 3 columns → vertical layout
      let colSizes;
      switch (settings.selectRatio) {
        case "2:1:1":
          colSizes = "2fr 1fr 1fr";
          break;
        case "1:2:1":
          colSizes = "1fr 2fr 1fr";
          break;
        case "1:1:2":
          colSizes = "1fr 1fr 2fr";
          break;
        default:
          colSizes = "1fr 1fr 1fr"; // "1:1:1"
      }

      return {
        display: "grid",
        gridTemplateColumns: colSizes,
        gridTemplateRows: "1fr",
        width: "100%",
        height: "100%",
      };
    }
  }

  // Grid type 2
  if (settings.gridType === "2") {
    if (settings.orientation === "vertical") {
      return {
        display: "grid",
        gridTemplateColumns:
          settings.selectRatio === "1:2"
            ? "1fr 2fr"
            : settings.selectRatio === "2:1"
            ? "2fr 1fr"
            : "1fr 1fr",
        gridTemplateRows: "1fr",
      };
    } else {
      return {
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows:
          settings.selectRatio === "1:2"
            ? "1fr 2fr"
            : settings.selectRatio === "2:1"
            ? "2fr 1fr"
            : "1fr 1fr",
      };
    }
  }

  // Grid type 1
  return { display: "grid", gridTemplateColumns: "1fr", gridTemplateRows: "1fr" };
};


  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* GRID */}
      <div
        className="grid-wrap"
        style={{
          flex: 1,
          display: "grid",
          width: "100%",
          height: "100%",
          ...getGridStyle(),
          transform: `rotate(${settings.rotation || 0}deg)`,
          transformOrigin: "center center",
        }}
      >
        <GridCell
          id="g1"
          media={grids.g1}
          onReplace={(items) => handleUploadReplace("g1", items)}
          settings={{ ...settings, slideDirection: settings.slideDirectionG1 }}
          style={{ gridArea: "g1",  width: "100%", height: "100%" }}
        />
        {(settings.gridType === "2" || settings.gridType === "3") && (
          <GridCell
            id="g2"
            media={grids.g2}
            onReplace={(items) => handleUploadReplace("g2", items)}
            settings={{ ...settings, slideDirection: settings.slideDirectionG2 }}
            style={{ gridArea: "g2",  width: "100%", height: "100%" }}
          />
        )}
        {settings.gridType === "3" && (
          <GridCell
            id="g3"
            media={grids.g3}
            onReplace={(items) => handleUploadReplace("g3", items)}
            settings={{ ...settings, slideDirection: settings.slideDirectionG3 }}
            style={{ gridArea: "g3",  width: "100%", height: "100%" }}
          />
        )}
      </div>

      {/* TICKER */}
      {settings.tickerEnabled && (
        <div
          className="ticker"
          style={{
            minHeight: `${settings.tickerFontSize * 2}px`,
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
            {dateString} | {settings.tickerText} &nbsp; &nbsp;
            {dateString} | {settings.tickerText}
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onClick={() => setShowPanel(true)}
          >
            <Settings size={22} className="text-white" />
          </div>
        </div>
      )}

      {showPanel && (
        <SidePanel
          settings={settings}
          onClose={() => setShowPanel(false)}
          onChange={handleSettingsChange}
        />
      )}
    </div>
  );
}
