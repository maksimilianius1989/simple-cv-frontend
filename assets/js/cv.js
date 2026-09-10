document.addEventListener("DOMContentLoaded", () => Cv.loadCV());

class Cv {
  static context = undefined;
  static isFake = false;
  static feedbackTimeoutFormTime = 3 * 60 * 1000;
  static templateId = undefined;

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
        Main.CACHE_KAY_RANDOM_DATA_TEMPLATE + slug,
      );
      if (!randomContent) {
        cvNotFoundContainer.classList.remove("hidden");
        return;
      }

      Cv.isFake = true;
      Cv.context = randomContent;
      Cv.templateId = slug;
    } else {
      Cv.context = await res.json();
      Cv.templateId = Cv.context.templateId;
    }

    if (!Cv.context) {
      cvNotFoundContainer.classList.remove("hidden");
      return;
    }

    cvContentContainer.classList.remove("hidden");

    const iframe = document.getElementById("cv-iframe");
    if (!iframe) return;

    try {
      const formData = Cv.isFake
        ? Utils.objectToFormData(Utils.fromFakeCvToRender(Cv.context))
        : Utils.objectToFormData(Utils.fromCvToRender(Cv.context));

      const renderRes = await fetch(
        `${APP_CONFIG.API_URL}/templates/${Cv.templateId}/render`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!renderRes)
        throw new Error(`Failed to upload template ${Cv.templateId}`);

      const htmlContent = await renderRes.text();
      iframe.srcdoc = htmlContent;

      document.getElementById("cv-letter").textContent =
        Cv.context.coverLetter || "Немає супровідного листа";

      if (Cv.isFake) return;

      const feedbackSection = document.querySelector(".feedback-section");
      if (feedbackSection) {
        console.log("feedbackSection");
        feedbackSection.dataset.cvId = Cv.context.id;
        feedbackSection.classList.remove("hidden");

        Cv.showFeedbackDialog(feedbackSection);
      }

      const pdfFileId = Cv.context.files?.find(
        (file) => file.category === "PDF",
      )?.id;
      const pdfBtn = document.getElementById("download-pdf");
      if (pdfFileId && pdfBtn) {
        pdfBtn.href = `${APP_CONFIG.API_URL}/cvs/storage/published/${pdfFileId}`;
        pdfBtn.classList.remove("hidden");
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
    }, Cv.feedbackTimeoutFormTime);
  }
}
