document.addEventListener("DOMContentLoaded", () => loadCV());

window.CV = {};

async function loadCV() {
  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    window.location.href = "/";
    return;
  }

  const res = await fetch(`${APP_CONFIG.API_URL}/cvs/public/${slug}`).catch(
    () => (window.location.href = "/"),
  );

  if (!res.ok) {
    window.location.href = "/";
    return;
  }
  window.CV = await res.json();

  if (!window.CV) {
    window.location.href = "/";
    return;
  }

  document.getElementById("cv-letter").textContent =
    window.CV.coverLetter || "Немає супровідного листа";

  document.getElementById("download-pdf").href =
    `${APP_CONFIG.API_URL}/cvs/storage/published/${window.CV.files.find((file) => file.category === "PDF")?.id}`;

  const iframe = document.getElementById("cv-iframe");
  if (!iframe) return;

  try {
    const renderRes = await fetch(
      `${APP_CONFIG.API_URL}/templates/${window.CV.templateId}/render`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar: `${APP_CONFIG.API_URL}/cvs/storage/published/${window.CV.files.find((file) => file.category === "AVATAR")?.id}`,
          content: window.CV.content
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
