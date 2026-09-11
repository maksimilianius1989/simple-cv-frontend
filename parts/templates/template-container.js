document.addEventListener("DOMContentLoaded", async (event) => {
  await TemplateContainer.init();
  document;
});

class TemplateContainer {
  static EVENT_RENDER_FINISED = "template-render::finished";
  static EVENT_TEMPLATE_SELECTED = "template::selected";

  static async init() {
    const container = document.getElementById("templates-list");
    if (!container) return;

    container.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = e.target.closest(".template-card");
      if (!card) return;

      const templateId = card.dataset.templateId;
      TemplateContainer.markAsSelected(container, templateId);
    });

    await TemplateContainer.render(container);
  }

  static async render(container) {
    const allTempaltes = await fetch(`${APP_CONFIG.API_URL}/templates`);

    const templates = await allTempaltes.json();
    if (!templates) return;

    const htmlTemplate = document.getElementById("template-card-template");
    if (!htmlTemplate) return;

    container.innerHTML = "";
    for (const [index, template] of templates.entries()) {
      const clone = htmlTemplate.content.cloneNode(true);

      const card = clone.querySelector(".template-card");
      const title = clone.querySelector("h3");
      const category = clone.querySelector(".template-badge");
      const iframe = clone.querySelector("iframe");

      card.dataset.templateId = template.id;
      if (title && template.name) {
        title.textContent = template.name;
      }

      if (category && template.category) {
        category.textContent = template.category;
      }

      if (iframe) {
        try {
          let cvContentObj = LocalStorageCache.get(
            Main.CACHE_KAY_RANDOM_DATA_TEMPLATE + template.id,
          );

          if (!cvContentObj) {
            const cvContentResponse = await fetch(
              `${APP_CONFIG.API_URL}/templates/random-content`,
            );
            if (!cvContentResponse.ok)
              throw new Error(`Failed to uplaod content ${template.id}`);

            cvContentObj = await cvContentResponse.json();

            LocalStorageCache.set(
              Main.CACHE_KAY_RANDOM_DATA_TEMPLATE + template.id,
              cvContentObj,
            );
          }

          const formData = Utils.objectToFormData(cvContentObj);

          const templateResponse = await fetch(
            `${APP_CONFIG.API_URL}/templates/${template.id}/render`,
            {
              method: "POST",
              body: formData,
            },
          );

          if (!templateResponse.ok)
            throw new Error(`Failed to uplaod tempalte ${template.id}`);

          const htmlContent = await templateResponse.text();
          iframe.srcdoc = htmlContent;
        } catch (e) {
          console.error(e);
        }
      }

      container.appendChild(clone);
    }

    document.querySelector(".template-section").classList.remove("hidden");
    
    window.dispatchEvent(
      new CustomEvent(TemplateContainer.EVENT_RENDER_FINISED, {detail: {container}}),
    );
  }

  static markAsSelected(container, templateId) {
    container.querySelectorAll(".template-card").forEach((element) => {
      element.classList.remove("template-selected");
    });

    const activeTemplate = container.querySelector(
      `.template-card[data-template-id="${templateId}"]`,
    );
    if (!activeTemplate) return;

    activeTemplate?.classList.add("template-selected");

    window.dispatchEvent(
      new CustomEvent(TemplateContainer.EVENT_TEMPLATE_SELECTED, {
        detail: { templateId },
      }),
    );
  }
}
