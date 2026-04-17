const API = "https://ai-chat-backend-sim2.onrender.com";
// const API = "http://localhost:5000";
const timeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), ms),
  );

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const fetchWithTimeout = () =>
    Promise.race([
      fetch(API + url, {
        ...options,
        credentials: "include",
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          Authorization: token ? `Bearer ${token}` : "",
          ...options.headers,
        },
      }),
      timeout(10000), // ⏱ 10s timeout
    ]);

  let res;

  try {
    res = await fetchWithTimeout();
  } catch (err) {
    throw new Error("Network timeout");
  }

  if (res.status === 401) {
    try {
      const refreshRes = await fetch(`${API}/api/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const data = await refreshRes.json();

      localStorage.setItem("token", data.accessToken);

      res = await fetchWithTimeout();
    } catch (err) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return;
    }
  }

  return res;
};

export default authFetch;
