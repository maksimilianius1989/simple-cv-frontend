document.addEventListener("DOMContentLoaded", () => Index.init());

class Index {
  static init() {
    Auth.checkParamToken();

    window.addEventListener("template::selected", Index.openTemplateHandler);
  }

  static openTemplateHandler = (event) => {
    window.open(`cv/${event.detail.templateId}`, "_blank");
  };
}
