document.addEventListener("DOMContentLoaded", async () => CvEditor.init());

class CvEditor {
  static async init() {
    if (!Auth.checkAuth() && !(await Auth.refreshToken())) {
      window.location.href = "/";
    }
  }
}
