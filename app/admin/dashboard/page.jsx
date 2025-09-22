"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");

    if (!token || !u) {
      window.location.href = "/admin/login"; // ✅ agar login nahi hai to redirect
    } else {
      setUser(JSON.parse(u));
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user.email}</h1>
      <p>Role: {user.role}</p>

      <h2>Admin Dashboard</h2>
      <ul>
        <li><a href="/admin/cms">Open CMS</a></li>
        <li><a href="/admin/devices">Manage Devices</a></li>
        <li><a href="/admin/users">Manage Users</a></li>
      </ul>
    </div>
  );
}
