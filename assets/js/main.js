async function authFetch(url, options = {}) {
  let token = localStorage.getItem(ACCESS_TOKEN);

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status == 200) {
    return res;
  }

  if (res.status === 401) {
    const refreshed = await refreshTokent();

    if (!refreshed) {
      logout();
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
  }

  throw new Error("Response error", res);
}

async function refreshTokent() {
  try {
    const res = await fetch(`${APP_CONFIG.API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();

    localStorage.setItem(ACCESS_TOKEN, data.accessToken);

    return true;
  } catch (e) {
    return false;
  }
}

async function logout() {
  localStorage.removeItem(ACCESS_TOKEN);
  window.location.href = "/";
}
