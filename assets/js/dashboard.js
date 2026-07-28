document.addEventListener("DOMContentLoaded", () => Dashboard.init());

class Dashboard {
  static init() {
    Dashboard.getDrafts();
    Dashboard.getCvs();
    Dashboard.openDraftWindowDialog();
  }

  static openDraftWindowDialog() {
    const createDraftBtn = document.querySelector('.resume-create-card');
    createDraftBtn.addEventListener('click', (event) => {
      const draftForm = new DraftForm();
      window.dispatchEvent(new CustomEvent('modal::open', {detail: {
        titleText: 'Draft CV',
        subtitleText: 'Створення чернетки резюме за допомогою AI',
        contentHtml: draftForm.getDraftFormTemplate(),
      }}));
    });
  }

  static async getCvs() {
    const cvs = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs`, { method: "GET" });
    const cvsAsJson = await cvs?.json();

    const container = document.getElementById("published-container");

    ResumeCard.renderResumeCards(container, cvsAsJson);
  }

  static async getDrafts() {
    const drafts = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs/ai-drafts`);
    const draftsJson = await drafts?.json();

    const container = document.getElementById("draft-container");

    DraftCard.renderDraftCards(container, draftsJson);
  }
}
