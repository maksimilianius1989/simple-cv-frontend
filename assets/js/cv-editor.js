document.addEventListener("DOMContentLoaded", async () => CvEditor.init());

class CvEditor {
  static debounceTimerForm = undefined;

  static async init() {
    if (!Auth.checkAuth() && !(await Auth.refreshToken())) {
      window.location.href = "/";
    }

    const activeTempalte = document.querySelector(".template-selected");
    if (activeTempalte) {
      CvEditor.renderPreview(activeTempalte.dataset.templateId);
    }

    window.addEventListener("template::selected", (e) => {
      CvEditor.renderPreview(e.detail.templateId);
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("#save-cv-button")) {
        e.preventDefault();
        e.stopPropagation();
        CvEditor.createCv();
      } else if (e.target.closest("#publish-cv-button")) {
        e.preventDefault();
        e.stopPropagation();
        CvEditor.createAndPublishCv();
      }
    });

    const form = document.getElementById("cv-form");
    form.addEventListener("input", (event) => {
      const activeTemplate = document.querySelector(".template-selected");
      if (!activeTemplate) return;

      clearTimeout(CvEditor.debounceTimerForm);

      CvEditor.debounceTimerForm = setTimeout(() => {
        CvEditor.renderPreview(activeTemplate.dataset.templateId);
      }, 1000);
    });
  }

  static async createCv() {
    const form = document.getElementById("cv-form");
    const formData = new FormData(form);

    const templateId =
      document.querySelector(".template-selected")?.dataset.templateId;
    if (templateId) {
      formData.append("templateId", templateId);
    }

    const errorHandler = new ErrorHandler(document.getElementById("cv-form"));
    errorHandler.reset();

    try {
      const response = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        errorHandler.setErrorResponse(response);
        return;
      }

      window.location.href = "/dashboard.html";
    } catch (e) {
      console.warn(e);
    }
  }

  static createAndPublishCv(form) {
    console.log("createAndPublishCv", form);
  }

  static async renderPreview(templateId) {
    const iframe = document.getElementById("cv-iframe");
    if (!iframe) return;

    const form = document.getElementById("cv-form");
    const jsonData = Utils.formDataToJson(form);
    const renderObj = Utils.fromCvToRender(jsonData);
    const formData = Utils.objectToFormData(renderObj);

    const renderRes = await fetch(
      `${APP_CONFIG.API_URL}/templates/${templateId}/render`,
      {
        method: "POST",
        body: formData,
      },
    );

    const errorHandler = new ErrorHandler(form);
    errorHandler.reset();

    if (!renderRes.ok) {
      errorHandler.setErrorResponse(renderRes);
      return;
    }

    const htmlContent = await renderRes.text();
    iframe.srcdoc = htmlContent;
  }
}
