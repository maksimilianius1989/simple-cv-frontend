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
    <div class="resume-preview"></div>
    <div class="resume-content">
      <h3>${cv.title}</h3>
      <span>${updatedAt}</span>
    </div>

    <div class="resume-actions">
      <button><i class="fa-solid fa-eye"></i></button>
      <button><i class="fa-solid fa-file-pdf"></i></button>
      <button><i class="fa-solid fa-trash"></i></button>
    </div>`;

    container.prepend(card);
  });
}
