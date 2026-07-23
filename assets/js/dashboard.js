(function () {
  async function getCvs() {
    const cvs = await authFetch(`${APP_CONFIG.API_URL}/cv`, { method: "GET" });
    const cvsAsJson = await cvs?.json();

    console.log(cvsAsJson);

    const container = document.getElementById("published-container");

    ResumeCard.renderResumeCards(container, cvsAsJson);
  }

  document.addEventListener("DOMContentLoaded", () => {
    getCvs();

    document
      .getElementById("logout-btn")
      ?.addEventListener("click", async () => {
        logout();
      });
  });
})();
