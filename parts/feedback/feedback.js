document.addEventListener("DOMContentLoaded", async () => {
  Feedback.init();
});

class Feedback {
  static async init() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".send-feedback");
      if (!btn) return;

      const feedbackSection = e.target.closest(".feedback-section");
      if (!feedbackSection) return;

      e.preventDefault();
      e.stopPropagation();

      Feedback.send(feedbackSection);
    });
  }

  static async send(feedbackSection) {
    const btn = feedbackSection.querySelector(".send-feedback");
    const emailEl = feedbackSection.querySelector(".feedback-email");
    const messageEl = feedbackSection.querySelector(".feedback-text");
    const cvId = feedbackSection.dataset.cvId;
    const errorHandler = new ErrorHandler(feedbackSection);
    errorHandler.reset();

    btn.disabled = true;
    btn.textContent = "Відправка...";

    const email = emailEl.value.trim();
    const message = messageEl.value.trim();

    try {
      const res = await fetch(`${APP_CONFIG.API_URL}/cvs/${cvId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, message }),
      });

      if (!res.ok) {
        errorHandler.setErrorResponse(res);
        return;
      }
    } catch (e) {
      errorHandler.setErrorResponse(e);
    } finally {
      btn.disabled = false;
      btn.textContent = "Надіслати";
    }
  }
}
