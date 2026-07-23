document.addEventListener("DOMContentLoaded", () => {
  loginDropdown();
  logoutClick();
  googleAuthRedirect();
  updateHeaderUI();
});

window.addEventListener(EVENT_USER_LOGOUT, () => updateHeaderUI());
async function updateHeaderUI() {
  const guestGroup = document.getElementById("auth-guest");
  const userGroup = document.getElementById("auth-user");
  const isAuthenticated = checkAuth();

  if (isAuthenticated) {
    guestGroup.classList.add("is-hidden");
    userGroup.classList.remove("is-hidden");
  } else {
    guestGroup.classList.remove("is-hidden");
    userGroup.classList.add("is-hidden");
  }
}

function loginDropdown() {
  const triggerBtn = document.getElementById("login-trigger");
  const dropdown = document.getElementById("login-dropdown");

  triggerBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    dropdown.classList.toggle("is-open");
    if (dropdown.classList.contains("is-open")) {
      const rect = triggerBtn.getBoundingClientRect();
      const topPosition = rect.bottom;
      const leftPosition = rect.right + window.scrollX - dropdown.offsetWidth;
      dropdown.style.top = `${topPosition + 8}px`;
      dropdown.style.left = `${leftPosition}px`;
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && event.target !== triggerBtn) {
      dropdown.classList.remove("is-open");
    }
  });
}

function logoutClick() {
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    logout();
  });
}

function googleAuthRedirect() {
  const googleBtn = document.getElementById("google-btn");
  if (googleBtn) {
    googleBtn.href = `${APP_CONFIG.API_URL}/auth/google`;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");
  if (tokenFromUrl) {
    localStorage.setItem(ACCESS_TOKEN, tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = "/dashboard.html";
  }
}

async function onTelegramAuth(user) {
  try {
    const fullName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ");
    const response = await fetch(
      `${APP_CONFIG.API_URL}/auth/telegram/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId: String(user.id),
          name: fullName || user.username,
          tgAuthData: user,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Server authorization error");
    }

    const data = await response.json();
    localStorage.setItem(ACCESS_TOKEN, data.accessToken);
    window.location.href = "/dashboard.html";
  } catch (error) {
    console.log("Telegram Auth Error:", error);
    alert("Unable to log in via Telegram");
  }
}
