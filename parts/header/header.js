document.addEventListener("DOMContentLoaded", () => {
  Header.init();
});

class Header {
  static init() {
    Header.loginDropdown();
    Header.logoutClick();
    Header.googleAuthRedirect();
    Header.updateHeaderUI();
    Header.donate();

    window.addEventListener("auth::logout", () => {
      Header.updateHeaderUI();
    });
  }

  static loginDropdown() {
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

  static updateHeaderUI() {
    const guestGroup = document.getElementById("auth-guest");
    const userGroup = document.getElementById("auth-user");
    const isAuthenticated = Auth.checkAuth();

    if (isAuthenticated) {
      guestGroup.classList.add("is-hidden");
      userGroup.classList.remove("is-hidden");
    } else {
      guestGroup.classList.remove("is-hidden");
      userGroup.classList.add("is-hidden");
    }
  }

  static logoutClick() {
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", async () => {
        Auth.logout();
      });
  }

  static googleAuthRedirect() {
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

  static async onTelegramAuth(user) {
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
      console.error("Telegram Auth Error:", error);

      alert("Unable to log in via Telegram");
    }
  }

  static async donate() {
    document
      .getElementById("buy-coffee-btn")
      ?.addEventListener("click", async (event) => {
        const btn = event.currentTarget;
        const amount = Number(btn.dataset.amount) || 100;

        try {
          btn.disabled = true;

          if (typeof window.Wayforpay === "undefined") {
            throw new Error(
              "Скрипт Wayforpay ще не завантажився або заблокований блокувальником реклами (AdBlock).",
            );
          }

          const response = await fetch(`${APP_CONFIG.API_URL}/payments/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: amount,
            }),
          });

          if (!response.ok) {
            throw new Error("Order initialization failed");
          }

          const paymentData = await response.json();
          const wayforpay = new window.Wayforpay();

          wayforpay.run(
            paymentData,
            function (response) {
              console.log("Payment success:", response);
              alert("Дякую за каву! ☕ Ваша підтримка неоціненна.");
            },
            function (response) {
              console.warn("Payment declined:", response);
              alert("Оплату скасовано або виникла помилка.");
            },
            function (response) {
              console.log("Widget closed:", response);
            },
          );
        } catch (error) {
          console.error(`Payment error:`, error);
          alert(error.message || "Щось пішло не так при створенні платежу.");
        } finally {
          btn.disabled = false;
        }
      });
  }
}
