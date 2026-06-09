async function getCvs() {
  const cvs = await authFetch(`${APP_CONFIG.API_URL}/cv`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
    },
  });

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
    const card = document.createElement("div");
    card.classList.add("resume-card");
    card.innerHTML = `
    <div class="resume-preview"></div>
    <div class="resume-content">
      <h3>${cv.title}</h3>
      <span>${cv.updatedAt}</span>
    </div>

    <div class="resume-actions">
      <button><i class="fa-solid fa-eye"></i></button>
      <button><i class="fa-solid fa-pen"></i></button>
      <button><i class="fa-solid fa-trash"></i></button>
    </div>`;

    container.prepend(card);
  });
}
