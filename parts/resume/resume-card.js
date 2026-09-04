document.addEventListener("DOMContentLoaded", () => {
  ResumeCard.cvCardUpdateEvent();
  ResumeCard.initContainerEvents();
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

  static initContainerEvents() {
    const container = document.getElementById("published-container");
    if (!container) return;

    container.addEventListener("click", async (e) => {
      const card = e.target.closest(".resume-card");
      if (!card) return;

      const cvId = card.dataset.id;

      const toggleBtn = e.target.closest(".action-toggle-publish");
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const isPublished = toggleBtn.dataset.isPublished === "true";
        await ResumeCard.togglePublishResume(cvId, isPublished);
        return;
      }

      const copyBtn = e.target.closest(".action-copy");
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const slug = copyBtn.dataset.slug;
        const shareUrl = `${window.location.origin}/cv.html?slug=${slug}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Посилання скопійовано!");
      }

      const deleteBtn = e.target.closest(".action-delete");
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        await ResumeCard.deleteResume(e);
        return;
      }

      const pdfBtn = e.target.closest(".action-pdf");
      if (pdfBtn) {
        e.stopPropagation();
      }
    });
  }

  static cvCardUpdateEvent() {
    window.addEventListener(ResumeCard.EVENT_CV_CARD_UPDATE, (event) => {
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
      Main.uploadAuthImg(
        `${APP_CONFIG.API_URL}/cvs/storage/${thumbnailId}`,
        target.querySelector(".preview-thumbnail"),
      );
    }

    const statusBadge = target.querySelector(".badge-status");

    if (cv.isPublished) {
      statusBadge.textContent = "🟢 Опубліковано";

    } else {
      statusBadge.textContent = "⚪ Не опубліковано";
      statusBadge.classList.add("disabled");
    }

    cvCardContainer.classList.toggle("published", cv.isPublished);

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

    const publicationInfo = target.querySelector(".publication-info");
    if (publicationInfo) {
      publicationInfo.classList.toggle("hidden", !cv.isPublished);
      if (cv.isPublished) {
        publicationInfo.textContent = `Дата публікації з ${Utils.dateFormatted(cv.publishedAt)} по ${Utils.dateFormatted(cv.publishedUntil)}`;
      }
    }

    const viewBtn = target.querySelector(".action-view");
    if (viewBtn) {
      viewBtn.href = `/cv.html?slug=${cv.publicSlug}`;
      viewBtn.classList.toggle("hidden", !cv.isPublished);
    }

    const pdfFile = cv.files.find((file) => file.category === "PDF");
    if (pdfFile) {
      const pdfBtn = target.querySelector(".action-pdf");
      if (pdfBtn) {
        pdfBtn.href = `${APP_CONFIG.API_URL}/cvs/storage/published/${pdfFile.id}`;
        pdfBtn.classList.toggle("hidden", !cv.isPublished);
      }
    }

    const copyBtn = target.querySelector(".action-copy");
    if (copyBtn) {
      copyBtn.dataset.slug = cv.publicSlug;
      copyBtn.classList.toggle("hidden", !cv.isPublished);
    }

    const toggleBtn = target.querySelector(".action-toggle-publish");
    if (toggleBtn) {
      toggleBtn.dataset.isPublished = cv.isPublished;
      const toggleIcon = toggleBtn.querySelector("i");
      toggleIcon.className = cv.isPublished ? "fa-solid fa-toggle-on" : "fa-solid fa-toggle-off";
      toggleBtn.title = cv.isPublished ? "Зняти з публікації" : "Опублікувати";
    }
  }

  static async togglePublishResume(id, status) {
    status ? ResumeCard.unpublishResume(id) : ResumeCard.publishResume(id);
  }

  static async deleteResume(event) {
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

  static async publishResume(cvId) {
    await Main.authFetch(`${APP_CONFIG.API_URL}/cvs/${cvId}/publish`, {
      method: "POST",
    });
  }

  static async unpublishResume(cvId) {
    await Main.authFetch(`${APP_CONFIG.API_URL}/cvs/${cvId}/unpublish`, {
      method: "POST",
    });
  }
}
