class ErrorHandler {
  #container = undefined;
  #errorMessage = undefined;
  #errorDetails = undefined;

  constructor(container) {
    this.#container = container;
  }

  async setErrorResponse(errorResponse) {
    const data = await errorResponse.json();
    const payload = data.error || data;

    if (!payload) return;

    this.#errorMessage = Array.isArray(payload.message)
      ? payload.message
      : [payload.message || "Помилка валідації"];

    this.#errorDetails = Array.isArray(payload.details)
      ? payload.details
      : payload.details
        ? [payload.details]
        : [];

    this.#render();
  }

  #render() {
    if (this.#errorMessage) {
      Toast.show("Помилка валізації", this.#errorMessage.join(" "));
    }

    if (this.#errorDetails) {
      this.#errorDetails.forEach((detail) => {
        if (!detail.field || !detail.message) {
          return;
        }

        const fieldName = this.#getFieldName(detail.field);
        const field = this.#container.querySelector(
          `[name=${CSS.escape(fieldName)}]`,
        );
        if (!field) {
          return;
        }

        field.classList.add("field-error");
        field.insertAdjacentHTML(
          "afterend",
          `<p class="field-error-message">${detail.message}</p>`,
        );
      });
    }
  }

  #getFieldName(field) {
    const parts = field.split(".");
    if (parts.length === 1) return field;

    const [first, ...rest] = parts;
    return `${first}${rest.map((part) => `[${part}]`).join("")}`;
  }

  reset() {
    this.#container
      .querySelectorAll(".field-error")
      .forEach((element) => element.classList.remove("field-error"));

    this.#container
      .querySelectorAll(".field-error-message")
      .forEach((element) => element.remove());
  }
}

class AlertToast {
  static EVENT_SHOW = "alert::show";

  #element;
  #timeout;

  constructor(element) {
    this.#element = element;

    this.#element
      .querySelector(".alert-toast__close")
      .addEventListener("click", () => this.hide());

    window.addEventListener(AlertToast.EVENT_SHOW, (payload) => {
      this.show(payload?.detail?.title, payload?.detail?.message);
    });
  }

  show(title = "Сповіщення", message = "Щось післо не так") {
    clearTimeout(this.#timeout);

    const titleElement = this.#element.querySelector(".alert-toast__title");

    const messageElement = this.#element.querySelector(".alert-toast__message");

    titleElement.textContent = title;
    messageElement.textContent = message;

    const progress = this.#element.querySelector(".alert-toast__progress");

    progress.style.animation = "none";
    progress.offsetHeight;
    progress.style.animation = "";

    this.#element.classList.add("alert-toast--visible");

    this.#timeout = setTimeout(() => {
      this.hide();
    }, 5000);
  }

  hide() {
    clearTimeout(this.#timeout);

    this.#element.classList.remove("alert-toast--visible");
  }
}

window.Toast = new AlertToast(document.querySelector("#alertToast"));
