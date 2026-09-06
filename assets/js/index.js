document.addEventListener("DOMContentLoaded", () => Index.init());

class Index {
  static init() {
    Auth.checkParamToken();

    window.addEventListener("template::select", Index.openTemplateHandler);
  }

  static openTemplateHandler = (event) => {
    window.open(`cv/${event.detail.templateId}`, '_blank');
  }
}
