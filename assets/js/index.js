document.addEventListener("DOMContentLoaded", () => Index.init());

class Index {
  static init() {
    Auth.checkParamToken();
  }
}
