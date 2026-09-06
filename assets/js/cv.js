document.addEventListener("DOMContentLoaded", () => loadCV());

window.CV = {};

async function loadCV() {
  const loadingContainer = document.querySelector(".cv-container-loading");
  const cvNotFoundContainer = document.querySelector(".cv-container-not-found");
  const cvContentContainer = document.querySelector(".cv-container-content");

  const paramSug = new URLSearchParams(window.location.search).get("slug");
  const pathSlug = window.location.pathname.split("/").filter(Boolean).pop();
  const slug = pathSlug || paramSug || null;

  loadingContainer.classList.add("hidden");

  if (!slug) {
    cvNotFoundContainer.classList.remove("hidden");
    return;
  }

  const res = await fetch(`${APP_CONFIG.API_URL}/cvs/public/${slug}`).catch(
    () => cvNotFoundContainer.classList.remove("hidden"),
  );

  if (!res.ok) {
    const randomContent = LocalStorageCache.get(
      `random-content-for-template_${slug}`,
    );
    if (!randomContent) {
      cvNotFoundContainer.classList.remove("hidden");
      return;
    }

    window.CV = JSON.parse(randomContent);
    window.CV.templateId = slug;
  } else {
    window.CV = await res.json();
  }

  if (!window.CV) {
    cvNotFoundContainer.classList.remove("hidden");
    return;
  }

  cvContentContainer.classList.remove("hidden");

  document.getElementById("cv-letter").textContent =
    window.CV.coverLetter || "Немає супровідного листа";

  const pdfFileId = window.CV.files?.find(
    (file) => file.category === "PDF",
  )?.id;
  if (pdfFileId) {
    document.getElementById("download-pdf").href =
      `${APP_CONFIG.API_URL}/cvs/storage/published/${pdfFileId}`;
  } else {
    document.getElementById("download-pdf")?.classList.add("hidden");
  }

  const iframe = document.getElementById("cv-iframe");
  if (!iframe) return;

  try {
    const avatar = window.CV.files?.find((file) => file.category === "AVATAR")?.id
      ? `${APP_CONFIG.API_URL}/cvs/storage/published/${window.CV.files?.find((file) => file.category === "AVATAR")?.id}`
      : window.CV.avatar;

    const renderRes = await fetch(
      `${APP_CONFIG.API_URL}/templates/${window.CV.templateId}/render`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar: avatar,
          content: window.CV.content,
        }),
      },
    );

    if (!renderRes)
      throw new Error(`Failed to upload template ${window.CV.templateId}`);

    const htmlContent = await renderRes.text();
    iframe.srcdoc = htmlContent;
  } catch (e) {
    console.error(e);
  }
}

async function sendFeedback(event) {
  const btn = event.target;

  const emailEl = document.getElementById("feedback-email");
  const messageEl = document.getElementById("feedback-text");
  const statusEl = document.getElementById("feedback-status");

  btn.disabled = true;
  btn.textContent = "Відправка...";

  const email = emailEl.value.trim();
  const message = messageEl.value.trim();

  try {
    const res = await fetch(`${APP_CONFIG.API_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        message,
        cvId: window.CV.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errors = Array.isArray(data.message)
        ? data.message
        : [data.message];

      statusEl.innerHTML = errors.join("<br>");
      statusEl.style.color = "red";
      return;
    }

    statusEl.textContent = "Відправлено успішно!";
    statusEl.style.color = "green";

    emailEl.value = "";
    messageEl.value = "";
  } catch (e) {
    statusEl.textContent = "Помилка мережі";
    statusEl.style.color = "red";
  } finally {
    btn.disabled = false;
    btn.textContent = "Надіслати";
  }
}
