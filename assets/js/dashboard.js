document.addEventListener("DOMContentLoaded", () => Dashboard.init());

class Dashboard {
  static init() {
    Dashboard.getDrafts();
    Dashboard.getCvs();
    Dashboard.openCreateDraftFormDialog();
  }

  static openCreateDraftFormDialog() {
    const createDraftBtn = document.querySelector(".resume-create-card");
    createDraftBtn.addEventListener("click", (event) => {
      const draftForm = new DraftForm();
      window.dispatchEvent(
        new CustomEvent("modal::open", {
          detail: {
            titleText: "Create Draft CV",
            subtitleText: "Створення чернетки резюме за допомогою AI",
            contentHtml: draftForm.getDraftFormTemplate(),
          },
        }),
      );
    });
  }

  static async setDraftInfoDialogHandle() {
    const draftCards = document.querySelectorAll(".draft");
    draftCards.forEach((draft) => {
      draft.addEventListener("click", async (event) => {
        event.preventDefault();

        const draftCardId = event.target.closest('.draft').dataset.id;
        const draft = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs/ai-drafts/${draftCardId}`);
        const draftJson = await draft?.json();
        const draftInfo = new DraftInfo(draftJson);
        
        window.dispatchEvent(
        new CustomEvent("modal::open", {
          detail: {
            titleText:draftJson?.content?.position || draftJson?.content?.name || "Draft CV Info",
            subtitleText: `Статус резюме ${draftJson.status}`,
            contentHtml: draftInfo.getDraftInfoTemplate(),
          },
        }),
      );
      });
    });
  }

  static async getCvs() {
    const cvs = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs`, {
      method: "GET",
    });
    const cvsAsJson = await cvs?.json();

    const container = document.getElementById("published-container");

    ResumeCard.renderResumeCards(container, cvsAsJson);
  }

  static async getDrafts() {
    const drafts = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs/ai-drafts`);
    const draftsJson = await drafts?.json();

    const container = document.getElementById("drafts-list");

    DraftCard.renderDraftCards(container, draftsJson);
    Dashboard.setDraftInfoDialogHandle();
  }
}
