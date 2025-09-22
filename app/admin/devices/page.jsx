"use client";
import { useEffect, useState } from "react";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [keys, setKeys] = useState({}); // store activation keys for each device

  useEffect(() => {
    fetchDevices();
  }, []);

 const fetchDevices = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/devices/list", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  console.log("Devices from API:", data);   // 👈 yaha dekhna
  setDevices(data.devices || []);
};


  const handleActivate = async (deviceId) => {
    const activationKey = keys[deviceId];
    if (!activationKey) {
      alert("Please enter activation key");
      return;
    }
    const token = localStorage.getItem("token");
    const res = await fetch("/api/devices/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ deviceId, activationKey }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Device activated!");
      fetchDevices(); // refresh list
    } else {
      alert(data.error || "Activation failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Devices</h1>
      <ul>
        {devices.map((d) => (
          <li key={d.deviceId}>
            <strong>{d.deviceId}</strong> – {d.active ? "✅ Active" : "❌ Inactive"}
            {!d.active && (
              <div>
                <input
                  type="text"
                  placeholder="Enter Activation Key"
                  value={keys[d.deviceId] || ""}
                  onChange={(e) =>
                    setKeys({ ...keys, [d.deviceId]: e.target.value })
                  }
                />
                <button onClick={() => handleActivate(d.deviceId)}>
                  Activate
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
