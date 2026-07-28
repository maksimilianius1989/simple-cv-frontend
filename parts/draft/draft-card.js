class DraftCard {
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
      const thumbnailId = draft.files?.find(
        (file) => file.category === "PREVIEW_THUMBNAIL",
      )?.id;
      if (thumbnailId) {
        const thumbnailTemplate = clone.querySelector(".preview-thumbnail");
        thumbnailTemplate.src = `${APP_CONFIG.API_URL}/cvs/storage/${thumbnailId}`;
      }

      const status = clone.querySelector(".draft-status");
      status.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ${draft.status}`;

      const draftDate = clone.querySelector(".resume-card-date");
      draftDate.textContent = Utils.dateFormatted(draft.updatedAt);

      const description = clone.querySelector(".resume-card-description");
      description.textContent = draft.prompt;

      container.appendChild(clone);
    });
  }
}
