async function fetchTokenFromDB(deviceId) {
  try {
    const res = await fetch(`/api/devices/getToken?deviceId=${encodeURIComponent(deviceId)}`);
    const data = await res.json();
    if (res.ok && data.token) {
      return data.token;
    } else {
      console.error("Token fetch failed:", data.error);
      return null;
    }
  } catch (err) {
    console.error("Token fetch error:", err);
    return null;
  }
}
