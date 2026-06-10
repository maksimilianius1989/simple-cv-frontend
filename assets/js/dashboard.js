async function getCvs() {
  const cvs = await authFetch(`${APP_CONFIG.API_URL}/cv`, { method: "GET" });

  renderCard(await cvs.json());
  hidePreloader();
}

function hidePreloader() {
  document.getElementById("container").style.display = "block";
  document.getElementById("app-loader").style.display = "none";
}

function renderCard(cvs) {
  const container = document.getElementById("resume-container");

  cvs.forEach((cv) => {
    const updatedAt = new Date(cv.updatedAt).toLocaleString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const card = document.createElement("div");
    card.classList.add("resume-card");
    card.innerHTML = `
    <div class="resume-card" 
     data-image="${APP_CONFIG.API_URL}${cv.previewPath}"
     data-letter="${cv.coverLetter}">
      <img
          src="${APP_CONFIG.API_URL}/uploads/previews/${cv.id}-small.png"
          alt="Preview"
      />
    </div>
   
    <div class="resume-content">
      <h3>${cv.title}</h3>
      <span>${updatedAt}</span>
    </div>

    <div class="resume-actions">
      <a href="${APP_CONFIG.API_URL}${cv.pdfPath}" target="_blank"><i class="fa-solid fa-file-pdf"></i></a>
    </div>`;

    container.prepend(card);
  });
}

document.addEventListener("click", (e) => {
  const card = e.target.closest(".resume-card");
  if (!card) return;

  const image = card.dataset.image;
  const letter =
  !card.dataset.letter ||
  card.dataset.letter === "null" ||
  card.dataset.letter === "undefined"
    ? "Немає супровідного листа"
    : card.dataset.letter;

  document.getElementById("modal-image").src = image;
  document.getElementById("modal-text").textContent = letter;

  document.getElementById("resume-modal").classList.remove("hidden");
});

// close modal
document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal-overlay") ||
    e.target.classList.contains("modal-close")
  ) {
    document.getElementById("resume-modal").classList.add("hidden");
  }
});
