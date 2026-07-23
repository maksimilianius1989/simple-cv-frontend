class ResumeCard {
  static renderResumeCards(container, resumes) {
    const template = document.getElementById("resume-card-template");

    if (!container || !template || !resumes?.lenght) return;

    container.innerHTML = "";

    resumes.forEach((cv) => {
      const clone = template.content.cloneNode(true);
      const cardElement = clone.querySelector(".resume-card");
      cardElement.dataset.id = cv.id;

      const statusBadge = clone.querySelector(".badge-status");
      if (cv.isPublished) {
        statusBadge.textContent = "🟢 Опубліковано";
      } else {
        statusBadge.textContent = "⚪ Чернетка";
        statusBadge.classList.add("disabled");
      }

      const viewsBadge = clone.querySelector(".badge-views");
      viewsBadge.textContent = `👁️ ${cv.viewsCount ?? 0} переглядів`;

      const title = clone.querySelector(".card-title");
      title.textContent = cv.title || cv.content?.position || "Без назви";

      const position = clone.querySelector(".card-position");
      position.textContent = cv.content?.position
        ? `Посада: ${cv.content.position}`
        : "";

      const viewBtn = clone.querySelector(".action-view");
      viewBtn.href = `/cv.html?id=${cv.id}`;

      const pdfBtn = clone.querySelector(".action-pdf");
      pdfBtn.href = `/api/v1/resumes/${cv.id}/pdf`;

      const copyBtn = clone.querySelector(".action-copy");
      copyBtn.addEventListener("click", () => {
        const shareUrl = `${window.location.origin}/cv.html?id=${cv.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Посилання скопійовано!");
      });

      const toggleBtn = clone.querySelector(".action-toggle-publish");
      const toggleIcon = toggleBtn.querySelector("i");


      if (!cv.isPublished) {
        toggleIcon.className = "fa-solid fa-toggle-off";
        toggleBtn.title = "Опублікувати";
      }

      toggleBtn.addEventListener("click", async () => {
        await ResumeCard.togglePublishResume(cv.id, !cv.isPublished);
      });

      const deleteBtn = clone.querySelector(".action-delete");
      deleteBtn.addEventListener("click", async () => {
        if (confirm("Ви дійсно хочете видалити це резюме?")) {
          await ResumeCard.deleteResume(cv.id);
        }
      });

      container.appendChild(clone);
    });
  }

  static async togglePublishResume(id, status) {
    console.log(`Toggle status for ${id} to ${status}`);
  }

  static async deleteResume(id) {
    console.log(`Delete resume ${id}`);
  }
}
