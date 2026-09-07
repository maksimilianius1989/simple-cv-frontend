class ErrorHandler {
  #container = undefined;
  #errorMessage = undefined;
  #errorDetails = undefined;
  

  constructor(container) {
    this.#container = container;
  }

  async setErrorResponse(errorResponse) {
    errorResponse = await errorResponse.json();
    if (!errorResponse.error) {
      return;
    }

    this.#errorMessage = Array.isArray(errorResponse.error.message)
      ? errorResponse.error.message
      : [errorResponse.error.message];

    this.#errorDetails = Array.isArray(errorResponse.error.details)
      ? errorResponse.error.details
      : [errorResponse.error.details];

    this.#render();
  }

  #render() {
    if (this.#errorMessage) {
      Toast.show("Помилка валізації", this.#errorMessage.join(" "));
    }

    if (this.#errorDetails) {
      this.#errorDetails.forEach((detail) => {
        const field = this.#container.querySelector(`[name="${detail.field}"]`);
        if (detail.field && detail.message && field) {
          field.classList.add("field-error");
          field.insertAdjacentHTML(
            "afterend",
            `<p class="field-error-message">${detail.message}</p>`,
          );
        }
      });
    }
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

    const titleElement = this.#element.querySelector(
      ".alert-toast__title",
    );

    const messageElement = this.#element.querySelector(
      ".alert-toast__message",
    );

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
window.Toast2 = new AlertToast(document.querySelector("#alertToast"));