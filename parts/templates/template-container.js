document.addEventListener("DOMContentLoaded", (event) => {
  TemplateContainer.init();
});

class TemplateContainer {
  static init() {
    const container = document.getElementById("templates-list");
    if (!container) return;

    TemplateContainer.render(container);
  }

  static async render(container) {
    const allTempaltes = await fetch(`${APP_CONFIG.API_URL}/templates`);

    const templates = await allTempaltes.json();

    if (!templates) return;

    const htmlTemplate = document.getElementById("template-card-template");
    if (!htmlTemplate) return;

    container.innerHTML = "";
    templates.forEach((template) => {
      const clone = htmlTemplate.content.cloneNode(true);

      const cardLink = clone.querySelector(".template-card");
      const title = clone.querySelector("h3");
      const category = clone.querySelector(".template-badge");
      const iframe = clone.querySelector("iframe");

      if (cardLink) {
        cardLink.href = `${APP_CONFIG.API_URL}/templates/${template.id}/render`;
      }

      if (title && template.name) {
        title.textContent = template.name;
      }

      if (category && template.category) {
        category.textContent = template.category;
        console.log(template.category);
        
      }

      if(iframe) {
        iframe.src = `${APP_CONFIG.API_URL}/templates/${template.id}/render`;
        iframe.title = template.name || 'Template';
      }

      container.appendChild(clone);
    });
  }
}
