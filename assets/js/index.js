document.addEventListener("DOMContentLoaded", () => Index.init());

class Index {
  static init() {
    Auth.checkParamToken();

    window.addEventListener("template::select", Index.openTemplateHandler);
  }

  static openTemplateHandler = (event) => {
    window.location.href = `cv/${event.detail.templateId}`;
  }
}
