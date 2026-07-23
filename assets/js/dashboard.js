document.addEventListener("DOMContentLoaded", () => Dashboard.init());

class Dashboard {
  static init() {
    Dashboard.getCvs();
  }

  static async getCvs() {
    const cvs = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs`, { method: "GET" });
    const cvsAsJson = await cvs?.json();

    const container = document.getElementById("published-container");

    ResumeCard.renderResumeCards(container, cvsAsJson);
  }
}
