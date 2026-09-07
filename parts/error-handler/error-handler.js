class ErrorHandler {
  #container = undefined;
  #errorMessage = undefined;
  #errorDetails = undefined;
  #toast = new ValidationToast(document.querySelector("#validationToast"));

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
      this.#toast.show(this.#errorMessage.join(" "));
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

class ValidationToast {
  #element;
  #timeout;

  constructor(element) {
    this.#element = element;

    this.#element
      .querySelector(".validation-toast__close")
      .addEventListener("click", () => this.hide());
  }

  show(message = "Перевірте правильність заповнення полів") {
    clearTimeout(this.#timeout);

    const messageElement = this.#element.querySelector(
      ".validation-toast__message",
    );

    messageElement.textContent = message;

    // Перезапускаємо progress animation
    const progress = this.#element.querySelector(".validation-toast__progress");

    progress.style.animation = "none";
    progress.offsetHeight;
    progress.style.animation = "";

    this.#element.classList.add("validation-toast--visible");

    this.#timeout = setTimeout(() => {
      this.hide();
    }, 5000);
  }

  hide() {
    clearTimeout(this.#timeout);

    this.#element.classList.remove("validation-toast--visible");
  }
}
