class Main {
  static async authFetch(url, options = {}) {
    if (!Auth.checkAuth()) {
      Auth.refreshToken();
    }

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

    const refreshed = await Auth.refreshToken();

    if (!refreshed) {
      await Auth.logout();
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
}

class Auth {
  static EVENT_USER_LOGOUT = "auth::logout";
  static refreshPromise = null;

  static async refreshToken() {
    if (Auth.refreshPromise) {
      return Auth.refreshPromise;
    }

    Auth.refreshPromise = (async () => {
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
        Auth.refreshPromise = null;
      }
    })();

    return Auth.refreshPromise;
  }

  static async logout() {
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
      window.dispatchEvent(new CustomEvent(Auth.EVENT_USER_LOGOUT));
    }
  }

  static checkAuth() {
    let token = localStorage.getItem(ACCESS_TOKEN);
    return Boolean(token);
  }

  static checkParamToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem(ACCESS_TOKEN, tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = "/dashboard.html";
    }
  }
}

class Utils {
  static dateFormatted(isoString) {
    const date = new Date(isoString);

    const formatter = new Intl.DateTimeFormat("uk-UA", {
      timeZone: "Europe/Kyiv",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour12: false,
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((p) => [p.type, p.value]),
    );

    return `${parts.hour}:${parts.minute}:${parts.second} ${parts.day}.${parts.month}.${parts.year}`;
  }
}
