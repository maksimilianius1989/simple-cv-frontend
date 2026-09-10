document.addEventListener("DOMContentLoaded", () => {
  WS.init();
});

class Main {
  static CACHE_KAY_RANDOM_DATA_TEMPLATE = "templateDemoData:";

  static async uploadAuthImg(url, container) {
    try {
      const response = await Main.authFetch(url);
      if (!response) throw new Error("Fail to upload auth IMG");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      container.src = objectUrl;
      container.onload = () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Faile to upload auth IMG: ", error);
    }
  }

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

    if (response.status !== 401) {
      return response;
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
  static EVENT_USER_REFRESH = "auth::refresh";
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

        window.dispatchEvent(
          new CustomEvent(Auth.EVENT_USER_REFRESH, {
            detail: { userId: Auth.getUserId() },
          }),
        );

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
      window.dispatchEvent(
        new CustomEvent(Auth.EVENT_USER_LOGOUT, { detail: {} }),
      );
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

  static getUserId() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  }
}

class Utils {
  static fromCvToRender(cvData) {
    const content = cvData?.content || cvData || {};
    const avatarId = cvData.files?.find(
      (file) => file.category === "AVATAR",
    )?.id;

    const avatarUrl = avatarId
      ? `${APP_CONFIG.API_URL}/cvs/storage/published/${avatarId}`
      : content?.avatarUrl;

    return {
      name: content.name ?? "",
      position: content.position ?? "",
      contacts: {
        phone: content.contacts?.phone ?? "",
        email: content.contacts?.email ?? "",
        location: content.contacts?.location ?? "",
        linkedin: content.contacts?.linkedin ?? "",
      },
      employmentType: content.employmentType ?? "",
      portfolios: Array.isArray(content.portfolios)
        ? content.portfolios.map((portfolio) => ({
            name: portfolio.name ?? "",
            url: portfolio.url ?? "",
          }))
        : [],
      summary: content.summary ?? "",
      skills: Array.isArray(content.skills) ? [...content.skills] : [],
      salary: content.salary ?? "",
      experience: Array.isArray(content.experience)
        ? content.experience.map((exp) => ({
            company: exp.company ?? "",
            position: exp.position ?? "",
            startDate: exp.startDate ?? null,
            endDate: exp.endDate ?? null,
            description: exp.description ?? "",
          }))
        : [],
      avatarUrl: avatarUrl ?? null,
      qr: content.qr ?? "",
      coverLetter: cvData.coverLetter ?? content.coverLetter ?? "",
    };
  }

  static fromFakeCvToRender(rawData) {
    return {
      name: rawData.name ?? "",
      position: rawData.position ?? "",
      contacts: {
        phone: rawData.contacts?.phone ?? "",
        email: rawData.contacts?.email ?? "",
        location: rawData.contacts?.location ?? "",
        linkedin: rawData.contacts?.linkedin ?? "",
      },
      employmentType: rawData.employmentType ?? "",
      portfolios: Array.isArray(rawData.portfolios)
        ? rawData.portfolios.map((portfolio) => ({
            name: portfolio.name ?? "",
            url: portfolio.url ?? "",
          }))
        : [],
      summary: rawData.summary ?? "",
      skills: Array.isArray(rawData.skills) ? [...rawData.skills] : [],
      salary: rawData.salary ?? "",
      experience: Array.isArray(rawData.experience)
        ? rawData.experience.map((exp) => ({
            company: exp.company ?? "",
            position: exp.position ?? "",
            startDate: exp.startDate ?? null,
            endDate: exp.endDate ?? null,
            description: exp.description ?? "",
          }))
        : [],
      avatarUrl: rawData.avatarUrl ?? "",
      file: null,
      qr: rawData.qr ?? "",
      coverLetter: rawData.coverLetter ?? "",
    };
  }

  static formDataToJson(form, asJsonString = false) {
    const formData = new FormData(form);
    const result = {};

    for (const [key, value] of formData.entries()) {
      // Розбиваємо ключі типу "experience[0][company]" або "contacts[email]" на масив ["experience", "0", "company"]
      const keys = key.replace(/\]/g, "").split("[");

      let current = result;

      for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        // Якщо це останній ключ у шляху — присвоюємо значення
        if (i === keys.length - 1) {
          // Якщо ключ порожній (наприклад, skills[]), додаємо елемент у масив
          if (k === "") {
            if (!Array.isArray(current)) current = [];
            current.push(value);
          } else if (current[k] !== undefined) {
            // Якщо ключ вже існує, робимо з нього масив (для multiple select або однакових inputs)
            if (!Array.isArray(current[k])) {
              current[k] = [current[k]];
            }
            current[k].push(value);
          } else {
            current[k] = value;
          }
        } else {
          // Перевіряємо, чи наступний ключ є числом (індексом масиву)
          const nextKey = keys[i + 1];
          const isNextKeyIndex =
            !isNaN(parseInt(nextKey, 10)) || nextKey === "";

          if (!current[k]) {
            current[k] = isNextKeyIndex ? [] : {};
          }

          current = current[k];
        }
      }
    }

    return asJsonString ? JSON.stringify(result, null, 2) : result;
  }

  static objectToFormData(data, formData = new FormData(), parentKey = "") {
    Object.entries(data).forEach(([key, value]) => {
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value instanceof File || value instanceof Blob) {
        formData.append(formKey, value);
        return;
      }

      if (value === null || value === undefined) {
        formData.append(formKey, "");
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            Utils.objectToFormData(item, formData, `${formKey}[${index}]`);
          } else {
            formData.append(`${formKey}[${index}]`, String(item));
          }
        });

        return;
      }

      if (typeof value === "object") {
        Utils.objectToFormData(value, formData, formKey);
        return;
      }

      formData.append(formKey, String(value));
    });

    return formData;
  }

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

class WS {
  static socket;

  static init() {
    window.addEventListener(Auth.EVENT_USER_REFRESH, () => WS.init());
    window.addEventListener(Auth.EVENT_USER_LOGOUT, () => WS.disconect());

    const userId = Auth.getUserId();
    if (!userId) {
      return;
    }

    WS.socket = io(`${APP_CONFIG.API_URL}/ws`, {
      path: "/ws",
      query: { userId },
      transports: ["websocket", "polling"],
    });
  }

  static disconect() {
    this.socket.disconect();
  }
}

class LocalStorageCache {
  static set(key, data, ttl = 30 * 60 * 1000) {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        expiresAt: Date.now() + ttl,
      }),
    );
  }

  static get(key) {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    try {
      const { data, expiresAt } = JSON.parse(value);

      if (Date.now() >= expiresAt) {
        localStorage.removeItem(key);

        return null;
      }

      return data;
    } catch {
      localStorage.removeItem(key);

      return null;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }
}
