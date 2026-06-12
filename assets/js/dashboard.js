async function getCvs() {
  const cvs = await authFetch(`${APP_CONFIG.API_URL}/cv`, { method: "GET" });

  renderCard(await cvs?.json());
  hidePreloader();
}

function hidePreloader() {
  document.getElementById("container").style.display = "block";
  document.getElementById("app-loader").style.display = "none";
}

function dateFormated(date) {
  return new Date(date).toLocaleString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countryToFlag(countryCode) {
  if (!countryCode) {
    return "🌍";
  }

  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt()))
    .join("");
}

function renderAnalytics(analytics) {
  return `
    <div class="views-wrapper">
      <span class="views-count">
        👁️ Кількість переглядів: ${analytics.totalViews}
      </span>

      <div class="views-tooltip">
        <div class="tooltip-section">
          <div class="tooltip-title">👀 Всього переглядів</div>
          <div class="tooltip-value">${analytics.totalViews}</div>
        </div>

        <div class="tooltip-section">
          <div class="tooltip-title">👥 Унікальних відвідувачів</div>
          <div class="tooltip-value">${analytics.uniqueVisitors}</div>
        </div>

        ${
          analytics.countries?.length
            ? `
          <div class="tooltip-section">
            <div class="tooltip-title">🌍 Країни</div>

            ${analytics.countries
              .map(
                (country) => `
                <div class="tooltip-row">
                  <span>
                    ${countryToFlag(country.country)}
                    ${country.country}
                  </span>

                  <span>${country.views}</span>
                </div>
              `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        ${
          analytics.cities?.length
            ? `
          <div class="tooltip-section">
            <div class="tooltip-title">📍 Міста</div>

            ${analytics.cities
              .map(
                (city) => `
                <div class="tooltip-row">
                  <span>${city.city}</span>

                  <span>${city.views}</span>
                </div>
              `,
              )
              .join("")}
          </div>
        `
            : ""
        }

        ${
          analytics.devices?.length
            ? `
          <div class="tooltip-section">
            <div class="tooltip-title">💻 Пристрої</div>

            ${analytics.devices
              .map(
                (device) => `
                <div class="tooltip-row">
                  <span>${device.device}</span>

                  <span>${device.views}</span>
                </div>
              `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

function renderCard(cvs) {
  const container = document.getElementById("resume-container");
  container.innerHTML = `
    <a
      class="resume-create telegram-link"
      href="${APP_CONFIG.TELEGRAM_BOT}"
      target="_blank"
    >
      <i class="fa-solid fa-plus"></i>
      <h3>Створити нове резюме</h3>
    </a>
  `;

  cvs.forEach((cv) => {
    const card = document.createElement("div");

    card.dataset.id = cv.id;
    card.dataset.published = cv.isPublished;
    card.dataset.slug = cv.publicSlug ?? "";
    card.dataset.image = `${APP_CONFIG.API_URL}${cv.previewPath}`;
    card.dataset.letter = cv.coverLetter ?? "";

    card.classList.add("resume-card");

    if (cv.isPublished) {
      card.classList.add("published");
    }

    card.innerHTML = `
        <img
          src="${APP_CONFIG.API_URL}/uploads/previews/${cv.id}-small.png"
          alt="Preview"
        />

        <div class="resume-content">
          <h3>${cv.title}</h3>
          <p>Створено: ${dateFormated(cv.createdAt)}</p>
          
          ${renderAnalytics(cv.analytics)}
          
          </br>
         ${
           cv.isPublished
             ? `
              
              <p>Дата публікації: ${dateFormated(cv.publishedAt)} до ${dateFormated(cv.publishedUntil)}</p>
              `
             : ""
         }

        <div class="resume-actions">
          <a href="${APP_CONFIG.API_URL}${cv.pdfPath}" target="_blank">
            <i class="fa-solid fa-file-pdf"></i>
          </a>

          ${
            cv.isPublished
              ? `
              <a href="/cv.html?slug=${cv.publicSlug}" target="_blank" title="Переглянути">
                <i class="fa-solid fa-eye"></i>
              </a>

              <a href="#" class="copy-link-btn" title="Скопіювати посилання">
                <i class="fa-solid fa-link"></i>
              </a>

              <a href="#" class="unpublish-btn" title="Відмінити публікацію">
                <i class="fa-solid fa-toggle-off"></i>
              </a>
              `
              : `
              <a href="#" class="publish-btn" title="Опублікувати">
                <i class="fa-solid fa-toggle-on"></i><span>
              </a>
              `
          }

          <a href="#" class="delete-btn" title="Видалити">
            <i class="fa-solid fa-trash-can"></i>
          </a>
        </div>
      `;

    container.prepend(card);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".resume-actions")) {
    return;
  }

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

document.addEventListener("click", async (e) => {
  const publishBtn = e.target.closest(".publish-btn");

  if (!publishBtn) {
    return;
  }

  e.preventDefault();

  const card = publishBtn.closest(".resume-card");
  const cvId = card.dataset.id;

  try {
    const response = await authFetch(
      `${APP_CONFIG.API_URL}/cv/${cvId}/publish`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error("Не вдалося опублікувати резюме");
    }

    alert("Резюме успішно опубліковано");

    await getCvs();
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("click", async (e) => {
  const publishBtn = e.target.closest(".unpublish-btn");

  if (!publishBtn) {
    return;
  }

  e.preventDefault();

  const card = publishBtn.closest(".resume-card");
  const cvId = card.dataset.id;

  try {
    const response = await authFetch(
      `${APP_CONFIG.API_URL}/cv/${cvId}/unpublish`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error("Не вдалося відмінити публікацію резюме");
    }

    alert("Резюме приховано");

    await getCvs();
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy-link-btn");
  if (!btn) return;

  e.preventDefault();

  const card = btn.closest(".resume-card");
  const slug = card.dataset.slug;

  const link = `${window.location.origin}/cv.html?slug=${slug}`;

  try {
    await navigator.clipboard.writeText(link);
    alert("Посилання скопійовано");
  } catch (err) {
    console.error(err);
    alert("Не вдалося скопіювати");
  }
});

document.addEventListener("click", async (e) => {
  const publishBtn = e.target.closest(".delete-btn");

  if (!publishBtn) {
    return;
  }

  e.preventDefault();

  const card = publishBtn.closest(".resume-card");
  const cvId = card.dataset.id;

  try {
    const response = await authFetch(
      `${APP_CONFIG.API_URL}/cv/${cvId}/delete`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error("Не вдалося видалити резюме");
    }

    alert("Резюме видалено");

    await getCvs();
  } catch (error) {
    alert(error.message);
  }
});
