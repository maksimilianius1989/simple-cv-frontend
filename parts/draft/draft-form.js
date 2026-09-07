class DraftForm {
  constructor() {
    const template = document.getElementById("draft-form-template");
    this.template = template.content.cloneNode(true);
    this.form = this.template.querySelector(".draft-form");

    this.setupEvents();
  }

  getDraftFormTemplate() {
    return this.template;
  }

  setupEvents() {
    const fileInput = this.form.querySelector(".file-input");
    const uploadWrapper = this.form.querySelector(".file-upload-wrapper");
    const filePreview = this.form.querySelector(".file-preview-info");
    const fileNameSpan = filePreview.querySelector("span");
    const removeFileBtn = filePreview.querySelector("button");

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (file) {
        fileNameSpan.textContent = file.name;
        uploadWrapper.classList.add("hidden");
        filePreview.classList.remove("hidden");
      }
    });

    removeFileBtn.addEventListener("click", () => {
      fileInput.value = "";
      filePreview.classList.add("hidden");
      uploadWrapper.classList.remove("hidden");
    });

    this.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const errorHandler = new ErrorHandler(event.target);
      errorHandler.reset();

      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      const formData = new FormData(this.form);
      this.form.action = `${APP_CONFIG.API_URL}/cvs/ai-drafts`;

      try {
        const response = await Main.authFetch(this.form.action, {
          method: this.form.method,
          body: formData,
        });

        if (response.ok) {
          window.dispatchEvent(new CustomEvent("modal::close"));
        } else {
          errorHandler.setErrorResponse(response);
        }
      } catch (e) {
        errorHandler.setErrorResponse(e);
        console.error("Network error", e);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
}
