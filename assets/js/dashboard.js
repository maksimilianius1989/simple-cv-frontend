document.addEventListener("DOMContentLoaded", () => Dashboard.init());

class Dashboard {
  static SOCKET_EVENT_DRAFTS_SYNC = "DRAFTS:SYNC";
  static SOCKET_EVENT_DRAFT_UPDATED = "DRAFT:UPDATED";

  static init() {
    Dashboard.getDrafts();
    Dashboard.getCvs();
    Dashboard.openCreateDraftFormDialog();
    Dashboard.onWsEventHandles();
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
    const container = document.getElementById("drafts-list");
    if (!container || container.dataset.hasListener) return;

    container.addEventListener("click", async (event) => {
      const draftCard = event.target.closest(".draft");
      if (!draftCard) return;

      event.preventDefault();

      const draftCardId = event.target.closest(".draft").dataset.id;
      const draft = await Dashboard.getDraft(draftCardId);
      const draftInfo = new DraftInfo(draft);

      window.dispatchEvent(
        new CustomEvent("modal::open", {
          detail: {
            titleText:
              draft?.content?.position ||
              draft?.content?.name ||
              "Draft CV Info",
            subtitleText: `Статус резюме ${draft.status}`,
            contentHtml: draftInfo.getDraftInfoTemplate(),
          },
        }),
      );
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

  static async getDraft(draftId) {
    const draft = await Main.authFetch(
      `${APP_CONFIG.API_URL}/cvs/ai-drafts/${draftId}`,
    );
    return await draft?.json();
  }

  static onWsEventHandles() {
    WS.socket.on(Dashboard.SOCKET_EVENT_DRAFTS_SYNC, async (data) => {
      Dashboard.getDrafts();
    });

    WS.socket.on(Dashboard.SOCKET_EVENT_DRAFT_UPDATED, async (data) => {
      const draft = await Dashboard.getDraft(data.draftId);
      window.dispatchEvent(new CustomEvent("draft-card:update", {detail: {draft: draft}}));
    });
  }
}
