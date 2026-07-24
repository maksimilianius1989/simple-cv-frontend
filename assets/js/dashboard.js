document.addEventListener("DOMContentLoaded", () => Dashboard.init());

class Dashboard {
  static init() {
    Dashboard.getCvs();
    Dashboard.openDraftWindowDialog();
  }

  static openDraftWindowDialog() {
    const createDraftBtn = document.querySelector('.resume-create-card');
    createDraftBtn.addEventListener('click', (event) => {


      window.dispatchEvent(new CustomEvent('modal::open', {detail: {}}));
    });
  }

  static async getCvs() {
    const cvs = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs`, { method: "GET" });
    const cvsAsJson = await cvs?.json();

    const container = document.getElementById("published-container");

    ResumeCard.renderResumeCards(container, cvsAsJson);
  }
}
