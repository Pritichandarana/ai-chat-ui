const API = "https://ai-chat-backend-sim2.onrender.com";

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
      timeout(10000),
    ]);

  let res;

  try {
    res = await fetchWithTimeout();
  } catch (err) {
    throw new Error("Network timeout");
  }

  // 🔁 HANDLE TOKEN REFRESH
  if (res.status === 401) {
    try {
      const refreshRes = await fetch(`${API}/api/refresh`, {
        method: "POST",
        credentials: "include",
      });
      console.log("updated");
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

  // 🔥 SAFE RESPONSE PARSE (IMPORTANT FIX)
  const contentType = res.headers.get("content-type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(text || "Invalid response from server");
  }

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};

export default authFetch;
