async function authFetch(url, options = {}) {
  let token = localStorage.getItem(ACCESS_TOKEN);

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return response;
  }

  if (response.status !== 401) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const refreshed = await refreshToken();

  if (!refreshed) {
    await logout();
    return null;
  }

  token = localStorage.getItem(ACCESS_TOKEN);

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed: ${res.status} ${errorText}`);
  }

  return res;
}

let refreshPromise = null;

async function refreshToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${APP_CONFIG.API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem(ACCESS_TOKEN, data.accessToken);

      return true;
    } catch (err) {
      console.error("Token refresh error", err);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function logout() {
  try {
    await fetch(`${APP_CONFIG.API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Enter error:", err);
  } finally {
    localStorage.removeItem(ACCESS_TOKEN);
    window.location.href = "/";
  }
}

async function checkAuth() {
  let token = localStorage.getItem(ACCESS_TOKEN);
  if (token) return;

  const refreshed = await refreshToken();
  if (refreshed) return;

  await logout();
}