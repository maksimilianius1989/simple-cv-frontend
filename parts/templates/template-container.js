document.addEventListener("DOMContentLoaded", async (event) => {
  await TemplateContainer.init();
});

class TemplateContainer {
  static async init() {
    const container = document.getElementById("templates-list");
    if (!container) return;

    await TemplateContainer.render(container);
  }

  static async render(container) {
    const allTempaltes = await fetch(`${APP_CONFIG.API_URL}/templates`);

    const templates = await allTempaltes.json();

    if (!templates) return;

    const htmlTemplate = document.getElementById("template-card-template");
    if (!htmlTemplate) return;

    container.innerHTML = "";
    templates.forEach(async (template) => {
      const clone = htmlTemplate.content.cloneNode(true);

      const title = clone.querySelector("h3");
      const category = clone.querySelector(".template-badge");
      const iframe = clone.querySelector("iframe");

      if (title && template.name) {
        title.textContent = template.name;
      }

      if (category && template.category) {
        category.textContent = template.category;
        console.log(template.category);
      }

      if (iframe) {
        try {
          const cvContentResponse = await fetch(`${APP_CONFIG.API_URL}/templates/random-content`);
          if (!cvContentResponse.ok) throw new Error(`Failed to uplaod content ${template.id}`);
          const cvContent = await cvContentResponse.json();

          const templateResponse = await fetch(`${APP_CONFIG.API_URL}/templates/${template.id}/render`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cvContent),
          });

          if (!templateResponse.ok) throw new Error(`Failed to uplaod tempalte ${template.id}`);

          const htmlContent = await templateResponse.text();
          iframe.srcdoc = htmlContent;
        } catch (e) {
          console.error(e)
        }
      }

      container.appendChild(clone);
    });
  }
}
