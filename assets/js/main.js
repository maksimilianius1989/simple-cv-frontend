async function authFetch(url, options = {}) {
  let token = localStorage.getItem(ACCESS_TOKEN);

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return response;
  }

  if (response.status !== 401) {
    throw new Error(`HTTP ${response.status}`);
  }

  const refreshed = await refreshTokent();

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

  return res;

  const errorText = await res.text();

  throw new Error(`Request failed: ${res.status} ${text}`);
}

let refreshPromise = null;
async function refreshTokent() {
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
  } finally {
    localStorage.removeItem(ACCESS_TOKEN);
    window.location.href = "/";
  }
}

async function onTelegramAuth(user) {
  try {
    const fullName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ");
    const response = await fetch(`${APP_CONFIG.API_URL}/auth/oauth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "TELEGRAM",
        providerId: String(user.id),
        name: fullName || user.username,
        tgAuthData: user,
      }),
    });

    if(!response.ok) {
      throw new Error('Server authorization error');
    }

    const data = await response.json();
    localStorage.setItem(ACCESS_TOKEN, data.accessToken);
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.log("Telegram Auth Error:", error);
    alert("Unable to log in via Telegram");
  }
}
