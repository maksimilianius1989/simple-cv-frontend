document.addEventListener("DOMContentLoaded", () => {
  DraftCard.draftCardUpdateEvent();
});

class DraftCard {
  static EVENT_DRAFT_CARD_UPDATE = "draft-card:update";

  static draftStatuses = {
    CREATED: "Створено",
    AVATAR_UPLOADED: "Завантажено аватар",
    GENERATING_CONTENT: "Початок генерації резюме ШІ",
    CONTENT_GENERATED: "Резюме зненеровано ШІ",
    PDF_GENERATED: "PDF згенеровано",
    PREVIEW_GENERATED: "Превю згенеровано",
    PREVIEW_THUMBNAIL_GENERATED: "Превю мініатюра згенерована",
    COMPLETED: "Згенеровано",
    FAILED: "Помилка",
  };

  static draftCardUpdateEvent() {
    window.addEventListener(DraftCard.EVENT_DRAFT_CARD_UPDATE, (event) => {
      const draft = event.detail.draft;
      if (!draft) return;

      const container = DraftCard.getDraftContainer(draft.id);
      if (!container) return;

      DraftCard.setDraftCard(container, draft);
    });
  }

  static renderDraftCards(container, drafts) {
    const template = document.getElementById("draft-card-template");

    if (!container || !template || !drafts.length) return;

    const crateCardBtn = container.querySelector(".resume-create-card");
    container.innerHTML = "";
    if (crateCardBtn) {
      container.appendChild(crateCardBtn);
    }

    drafts.forEach((draft) => {
      const clone = template.content.cloneNode(true);
      const cardElement = clone.querySelector(".resume-card");
      cardElement.dataset.id = draft.id;

      DraftCard.setDraftCard(clone, draft);

      container.appendChild(clone);
    });
  }

  static getDraftContainer(draftId) {
    const draftContainer = document.getElementById("drafts-list");
    return draftContainer.querySelector(`[data-id="${draftId}"]`);
  }

  static setDraftCard(target, draft) {
    const draftCardContainer = target.querySelector('.draft');

    const thumbnailId = draft.files?.find(
      (file) => file.category === "PREVIEW_THUMBNAIL",
    )?.id;

    if (thumbnailId) {
      const thumbnailTemplate = target.querySelector(".preview-thumbnail");
      thumbnailTemplate.src = `${APP_CONFIG.API_URL}/cvs/storage/${thumbnailId}`;
    }

    const status = target.querySelector(".draft-status");
    status.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ${DraftCard.mappingStatus(draft.status)}`;

    switch (draft.status) {
      case "COMPLETED":
        status.style.color = "green";
        if (draftCardContainer.classList.contains("is-generationg")) {
          draftCardContainer.classList.remove("is-generationg");
        }
        break;

      case "FAILED":
        status.style.color = "red";
        if (draftCardContainer.classList.contains("is-generationg")) {
          draftCardContainer.classList.remove("is-generationg");
        }
        break;
    }

    const draftDate = target.querySelector(".resume-card-date");
    draftDate.textContent = Utils.dateFormatted(draft.createdAt);

    const description = target.querySelector(".resume-card-description");
    description.textContent = draft.prompt;

    const deleteBtn = target.querySelector(".btn-delete");
    deleteBtn.addEventListener("click", (e) => DraftCard.deleteDraft(e));

    const pdfFile = draft.files.find((file) => file.category === "PDF");
    if (pdfFile) {
      const pdfBtn = target.querySelector(".btn-pdf");
      pdfBtn.style.display = "flex";
      pdfBtn.href = `${APP_CONFIG.API_URL}/cvs/storage/${pdfFile.id}`;
      pdfBtn.addEventListener("click", (e) => e.stopPropagation());
    }
  }

  static async deleteDraft(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm("Ви дійсно хочете видалити драфт?")) return;

    const draftId = event.target.closest(".draft").dataset.id;

    const response = await Main.authFetch(
      `${APP_CONFIG.API_URL}/cvs/ai-drafts/${draftId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      console.error(response);
      alert("Не вдалось видалити драфт");
    }
  }

  static mappingStatus(status) {
    return DraftCard.draftStatuses[status] || status;
  }
}
