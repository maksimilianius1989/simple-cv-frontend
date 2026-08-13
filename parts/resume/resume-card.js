document.addEventListener("DOMContentLoaded", () => {
  ResumeCard.cvCardUpdateEvent();
});

class ResumeCard {
  static EVENT_CV_CARD_UPDATE = "cv-card:update";

  static cvStatuses = {
    CREATED: "Створено",
    AVATAR_UPLOADED: "Завантажено аватар",
    PDF_GENERATED: "PDF згенеровано",
    PREVIEW_GENERATED: "Превю згенеровано",
    PREVIEW_THUMBNAIL_GENERATED: "Превю мініатюра згенерована",
    COMPLETED: "Згенеровано",
    FAILED: "Помилка",
  };

  static renderResumeCards(container, resumes) {
    const template = document.getElementById("resume-card-template");

    if (!container || !template) return;

    container.innerHTML = "";

    resumes.forEach((cv) => {
      const clone = template.content.cloneNode(true);
      const cardElement = clone.querySelector(".resume-card");
      cardElement.dataset.id = cv.id;

      ResumeCard.setCvCard(clone, cv);

      container.appendChild(clone);
    });
  }

  static cvCardUpdateEvent() {
    window.addEventListener(ResumeCard.EVENT_CV_CARD_UPDATE, () => {
      const cv = event.detail.cv;
      if (!cv) return;

      const container = ResumeCard.getCvContainer(cv.id);
      if (!container) return;

      ResumeCard.setCvCard(container, cv);
    });
  }

  static setCvCard(target, cv) {
    const cvCardContainer = target.classList?.contains("resume")
      ? target
      : target.querySelector(".resume");

    const thumbnailId = cv.files?.find(
      (file) => file.category === "PREVIEW_THUMBNAIL",
    )?.id;

    if (thumbnailId) {
      const thumbnailTemplate = target.querySelector(".preview-thumbnail");
      thumbnailTemplate.src = `${APP_CONFIG.API_URL}/cvs/storage/${thumbnailId}`;
    }

    const statusBadge = target.querySelector(".badge-status");

    if (cv.isPublished) {
      statusBadge.textContent = "🟢 Опубліковано";
    } else {
      statusBadge.textContent = "⚪ Не опубліковано";
      statusBadge.classList.add("disabled");
    }

    const cvStatusTemplate = target.querySelector(".cv-status");
    cvStatusTemplate.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> ${ResumeCard.mappingStatus(cv.status)}`;

    switch (cv.status) {
      case "COMPLETED":
        cvStatusTemplate.style.color = "green";
        if (cvCardContainer.classList.contains("is-generationg")) {
          cvCardContainer.classList.remove("is-generationg");
        }
        break;

      case "FAILED":
        cvStatusTemplate.style.color = "red";
        if (cvCardContainer.classList.contains("is-generationg")) {
          cvCardContainer.classList.remove("is-generationg");
        }
        break;
    }

    const viewsBadge = target.querySelector(".badge-views");
    viewsBadge.textContent = `👁️ ${cv.viewsCount ?? 0} переглядів`;

    const title = target.querySelector(".card-title");
    title.textContent = cv.title || cv.content?.position || "Без назви";

    const position = target.querySelector(".card-position");
    position.textContent = cv.content?.position
      ? `Посада: ${cv.content.position}`
      : "";

    const viewBtn = target.querySelector(".action-view");
    viewBtn.href = `/cv.html?id=${cv.id}`;

    const pdfFile = cv.files.find((file) => file.category === "PDF");
    if (pdfFile) {
      const pdfBtn = target.querySelector(".action-pdf");
      
      if(pdfBtn.classList.contains("hidden")) {
        pdfBtn.classList.remove("hidden");
      }

      pdfBtn.href = `${APP_CONFIG.API_URL}/cvs/storage/${pdfFile.id}`;
      pdfBtn.addEventListener("click", (e) => e.stopPropagation());
    }

    const copyBtn = target.querySelector(".action-copy");
    copyBtn.addEventListener("click", () => {
      const shareUrl = `${window.location.origin}/cv.html?id=${cv.id}`;
      navigator.clipboard.writeText(shareUrl);
      alert("Посилання скопійовано!");
    });

    const toggleBtn = target.querySelector(".action-toggle-publish");
    const toggleIcon = toggleBtn.querySelector("i");

    if (!cv.isPublished) {
      toggleIcon.className = "fa-solid fa-toggle-off";
      toggleBtn.title = "Опублікувати";
    }

    toggleBtn.addEventListener("click", async () => {
      await ResumeCard.togglePublishResume(cv.id, !cv.isPublished);
    });

    const deleteBtn = target.querySelector(".action-delete");
    deleteBtn.addEventListener("click", async (event) => {
      await ResumeCard.deleteResume(event);
    });
  }

  static async togglePublishResume(id, status) {
    console.info(`Toggle status for ${id} to ${status}`);
  }

  static async deleteResume(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm("Ви дійсно хочете видалити це резюме?")) return;

    const cvId = event.target.closest(".resume").dataset.id;

    const response = await Main.authFetch(`${APP_CONFIG.API_URL}/cvs/${cvId}`, {
      method: "DELETE",
    });
    if (response.ok) return;

    console.error(response);
    alert("Не вдалось видалити резюме");
  }

  static mappingStatus(status) {
    return ResumeCard.cvStatuses[status] || status;
  }

  static getCvContainer(cvId) {
    const cvContainer = document.getElementById("published-container");
    return cvContainer.querySelector(`[data-id="${cvId}"]`);
  }
}
