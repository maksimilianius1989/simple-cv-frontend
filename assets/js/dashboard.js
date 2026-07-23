(function () {
  document.addEventListener("DOMContentLoaded", () => {
    getCvs();
  });

  async function getCvs() {
    const cvs = await authFetch(`${APP_CONFIG.API_URL}/cvs`, { method: "GET" });
    const cvsAsJson = await cvs?.json();

    const container = document.getElementById("published-container");

    ResumeCard.renderResumeCards(container, cvsAsJson);
  }
})();
