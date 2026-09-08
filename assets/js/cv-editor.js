document.addEventListener("DOMContentLoaded", async () => CvEditor.init());

class CvEditor {
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
  }

  static async renderPreview(templateId) {
    const iframe = document.getElementById("cv-iframe");
    if (!iframe) return;

    const renderRes = await fetch(
      `${APP_CONFIG.API_URL}/templates/${templateId}/render`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar: undefined,
          content: undefined,
        }),
      },
    );

    const htmlContent = await renderRes.text();
    iframe.srcdoc = htmlContent;
  }
}
