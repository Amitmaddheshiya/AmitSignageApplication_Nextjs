"use client";
import { useState } from "react";

export default function ActivateDevicePage() {
  const [deviceId, setDeviceId] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/devices/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId, activationKey }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Device activated successfully!");
      } else {
        alert(data.error || "Activation failed");
      }
    } catch (err) {
      console.error("Activation error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h1>Activate Device</h1>
      <form onSubmit={handleActivate}>
        <input
          type="text"
          placeholder="Device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          required
        /><br />
        <input
          type="text"
          placeholder="Activation Key"
          value={activationKey}
          onChange={(e) => setActivationKey(e.target.value)}
          required
        /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Activating..." : "Activate"}
        </button>
      </form>
    </div>
  );
}
