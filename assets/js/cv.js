async function loadCV() {
  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    window.location.href = "/";
    return;
  }

  const res = await fetch(`${APP_CONFIG.API_URL}/cv/published/${slug}`).catch(
    () => (window.location.href = "/"),
  );

  if (!res.ok) {
    window.location.href = "/";
    return;
  }
  const cv = await res.json();

  if (!cv) {
    window.location.href = "/";
    return;
  }

  document.getElementById("cv-image").src = `${APP_CONFIG.API_URL}/files/${cv.files.PREVIEW}`;

  document.getElementById("cv-letter").textContent =
    cv.coverLetter || "Немає супровідного листа";

  document.getElementById("download-pdf").href = `${APP_CONFIG.API_URL}/files/${cv.files.PDF}`;
}
