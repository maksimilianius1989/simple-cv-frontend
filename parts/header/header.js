document.addEventListener("DOMContentLoaded", () => {
  const telegramLinks = document.querySelectorAll(".telegram-link");
  telegramLinks.forEach((link) => (link.href = APP_CONFIG.TELEGRAM_BOT));

  const googleBtn = document.getElementById("google-btn");
  if (googleBtn) {
    googleBtn.href = `${APP_CONFIG.API_URL}/auth/google`;
  }

  const token = localStorage.getItem(ACCESS_TOKEN);
  const mainBtn = document.getElementById("main-btn");

  if (token && mainBtn) {
    mainBtn.textContent = "Особистий кабінет";
    mainBtn.href = "/dashboard";
    mainBtn.classList.remove("telegram-link");
    mainBtn.classList.add("btn-secondary");

    const tgWidget = document.getElementById("telegram-widget-container");
    if (tgWidget) tgWidget.style.display = "none";

    const googleBtn = document.getElementById("google-btn");
    if (googleBtn) googleBtn.style.display = "none";
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");
  if (tokenFromUrl) {
    localStorage.setItem(ACCESS_TOKEN, tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = "/dashboard";
  }
});
