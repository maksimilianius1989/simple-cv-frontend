document.addEventListener("DOMContentLoaded", () => CV.loadCV());

class CV {
  static context = undefined;
  static isFake = false;
  static feedbackTimeoutFormTime = 3 * 60 * 1000;

  static async loadCV() {
    const loadingContainer = document.querySelector(".cv-container-loading");
    const cvNotFoundContainer = document.querySelector(
      ".cv-container-not-found",
    );
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

      CV.isFake = true;
      CV.context = JSON.parse(randomContent);
      CV.context.templateId = slug;
    } else {
      CV.context = await res.json();
    }

    if (!CV.context) {
      cvNotFoundContainer.classList.remove("hidden");
      return;
    }

    cvContentContainer.classList.remove("hidden");

    const iframe = document.getElementById("cv-iframe");
    if (!iframe) return;

    try {
      const avatarId = CV.context.files?.find(
        (file) => file.category === "AVATAR",
      )?.id;

      const avatar = avatarId
        ? `${APP_CONFIG.API_URL}/cvs/storage/published/${avatarId}`
        : CV.context.avatar;

      const renderRes = await fetch(
        `${APP_CONFIG.API_URL}/templates/${CV.context.templateId}/render`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avatar: avatar,
            content: CV.context.content,
          }),
        },
      );

      if (!renderRes)
        throw new Error(`Failed to upload template ${CV.context.templateId}`);

      const htmlContent = await renderRes.text();
      iframe.srcdoc = htmlContent;

      if (CV.isFake) {
        return;
      }

      const sideBar = document.querySelector(".cv-sidebar");
      if (!sideBar) {
        return;
      }

      sideBar.classList.toggle("hidden", CV.isFake);

      const feedbackSection = document.querySelector(".feedback-section");
      if (!feedbackSection) return;

      feedbackSection.dataset.cvId = CV.context.id;

      CV.showFeedbackDialog(feedbackSection);

      document.getElementById("cv-letter").textContent =
        CV.context.coverLetter || "Немає супровідного листа";

      const pdfFileId = CV.context.files?.find(
        (file) => file.category === "PDF",
      )?.id;
      if (pdfFileId) {
        document.getElementById("download-pdf").href =
          `${APP_CONFIG.API_URL}/cvs/storage/published/${pdfFileId}`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  static showFeedbackDialog(feedbackSection) {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("modal::open", {
          detail: {
            titleText: "Надіслати відгук",
            subtitleText:
              "Кандидат зацікавлений у вашій пропозиції та з нетерпінням чекає на неї.",
            contentHtml: feedbackSection.outerHTML,
          },
        }),
      );
    }, CV.feedbackTimeoutFormTime);
  }
}
