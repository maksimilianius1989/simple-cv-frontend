document.addEventListener("DOMContentLoaded", async () => CvEditor.init());

class CvEditor {
  static debounceTimerForm = undefined;
  static renderController = null;

  static async init() {
    if (!Auth.checkAuth() && !(await Auth.refreshToken())) {
      window.location.href = "/";
    }

    const activeTempalte = document.querySelector(".template-selected");
    if (activeTempalte) {
      CvEditor.renderPreview(activeTempalte.dataset.templateId);
    }

    window.addEventListener("template::selected", (e) => {
      CvEditor.renderPreview(e.detail.templateId);
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("#save-cv-button")) {
        e.preventDefault();
        e.stopPropagation();

        switch (e.target.closest("#save-cv-button").dataset.type) {
          case "create":
          case "clone":
            CvEditor.createCv(`${APP_CONFIG.API_URL}/cvs`, "POST");
          case "edit":
            const params = new URLSearchParams(window.location.search);
            if (params.has("cv")) {
              CvEditor.createCv(
                `${APP_CONFIG.API_URL}/cvs/${params.get("cv")}`,
                "PATCH",
              );
            }
            break;
        }
      }

      if (e.target.closest("#add-experience-button")) {
        e.preventDefault();
        CvEditor.addExperienceItem();
      } else if (e.target.closest("#add-skill-button")) {
        e.preventDefault();
        CvEditor.addSkillItem();
      } else if (e.target.closest("#add-portfolio-button")) {
        e.preventDefault();
        CvEditor.addPortfolioItem();
      }

      if (e.target.closest(".remove-dynamic-item")) {
        e.preventDefault();
        const btn = e.target.closest(".remove-dynamic-item");
        const item = btn.closest(".dynamic-item");
        if (item) {
          item.remove();
          CvEditor.reindexDynamicLists();
          CvEditor.onRenderPreview();
        }
      }
    });

    const skillInput = document.getElementById("skill-input");
    if (skillInput) {
      skillInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          CvEditor.addSkillItem();
        }
      });
    }

    const form = document.getElementById("cv-form");
    form.addEventListener("input", () => CvEditor.onRenderPreview());

    const avatarFileInput = document.getElementById("avatar-file");
    const avatarPreview = document.getElementById("avatar-preview");

    if (avatarFileInput) {
      avatarFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            avatarPreview.src = event.target.result;
            avatarPreview.style.display = "block";
          };
          reader.readAsDataURL(file);
        } else if (avatarPreview) {
          avatarPreview.src = "";
          avatarPreview.style.display = "none";
        }
      });
    }

    CvFormLoader.init();
  }

  static addExperienceItem(data = {}) {
    const list = document.getElementById("experience-list");
    if (!list) return;

    const index = list.querySelectorAll(".dynamic-item").length;
    const itemHtml = `
      <div class="dynamic-item form-card" style="position: relative; margin-bottom: 16px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <button type="button" class="remove-dynamic-item btn-icon" style="position: absolute; top: 12px; right: 12px; border: none; background: transparent; cursor: pointer; color: #ef4444;" title="Видалити">
          <i class="fa-solid fa-trash"></i>
        </button>
        <div class="form-group">
          <label class="form-label">Компанія</label>
          <input type="text" name="experience[${index}][company]" class="form-input" value="${data.company || ""}" placeholder="Назва компанії" />
        </div>
        <div class="form-group">
          <label class="form-label">Посада</label>
          <input type="text" name="experience[${index}][position]" class="form-input" value="${data.position || ""}" placeholder="Software Engineer" />
        </div>
        <div class="form-row" style="display: flex; gap: 12px;">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Дата початку</label>
            <input type="month" name="experience[${index}][startDate]" class="form-input" value="${data.startDate || ""}" />
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Дата закінчення</label>
            <input type="month" name="experience[${index}][endDate]" class="form-input" value="${data.endDate || ""}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Опис обов'язків</label>
          <textarea name="experience[${index}][description]" class="form-input form-textarea" placeholder="Опишіть ваші досягнення...">${data.description || ""}</textarea>
        </div>
      </div>
    `;

    list.insertAdjacentHTML("beforeend", itemHtml);
    CvEditor.onRenderPreview();
  }

  static addSkillItem(value = "") {
    const input = document.getElementById("skill-input");
    const skillValue = value || input?.value?.trim();
    if (!skillValue) return;

    const list = document.getElementById("skills-list");
    if (!list) return;

    const index = list.querySelectorAll(".dynamic-item").length;
    const itemHtml = `
      <div class="dynamic-item skill-badge" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #64748b; border-radius: 16px; margin: 4px;">
        <span>${skillValue}</span>
        <input type="hidden" name="skills[${index}]" value="${skillValue}" />
        <button type="button" class="remove-dynamic-item" style="border: none; background: transparent; cursor: pointer; color: #64748b; font-size: 12px;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    list.insertAdjacentHTML("beforeend", itemHtml);
    if (input && !value) input.value = "";
    CvEditor.onRenderPreview();
  }

  static addPortfolioItem(data = {}) {
    const list = document.getElementById("portfolio-list");
    if (!list) return;

    const index = list.querySelectorAll(".dynamic-item").length;
    const itemHtml = `
      <div class="dynamic-item form-card" style="position: relative; margin-bottom: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <button type="button" class="remove-dynamic-item btn-icon" style="position: absolute; top: 10px; right: 10px; border: none; background: transparent; cursor: pointer; color: #ef4444;" title="Видалити">
          <i class="fa-solid fa-trash"></i>
        </button>
        <div class="form-group">
          <label class="form-label">Назва проєкту / Ресурсу</label>
          <input type="text" name="portfolios[${index}][name]" class="form-input" value="${data.name || ""}" placeholder="GitHub, Personal Site тощо" />
        </div>
        <div class="form-group">
          <label class="form-label">URL</label>
          <input type="url" name="portfolios[${index}][url]" class="form-input" value="${data.url || ""}" placeholder="https://..." />
        </div>
      </div>
    `;

    list.insertAdjacentHTML("beforeend", itemHtml);
    CvEditor.onRenderPreview();
  }

  static reindexDynamicLists() {
    document
      .querySelectorAll("#experience-list .dynamic-item")
      .forEach((item, idx) => {
        item.querySelectorAll("input, textarea").forEach((field) => {
          field.name = field.name.replace(
            /experience\[\d+\]/,
            `experience[${idx}]`,
          );
        });
      });

    document
      .querySelectorAll("#skills-list .dynamic-item")
      .forEach((item, idx) => {
        const field = item.querySelector("input[type='hidden']");
        if (field) field.name = `skills[${idx}]`;
      });

    document
      .querySelectorAll("#portfolio-list .dynamic-item")
      .forEach((item, idx) => {
        item.querySelectorAll("input").forEach((field) => {
          field.name = field.name.replace(
            /portfolios\[\d+\]/,
            `portfolios[${idx}]`,
          );
        });
      });
  }

  static onRenderPreview() {
    const activeTemplate = document.querySelector(".template-selected");
    if (!activeTemplate) return;

    clearTimeout(CvEditor.debounceTimerForm);

    CvEditor.debounceTimerForm = setTimeout(() => {
      CvEditor.renderPreview(activeTemplate.dataset.templateId);
    }, 1000);
  }

  static async createCv(url, method) {
    const form = document.getElementById("cv-form");
    const formData = new FormData(form);

    const avatarFileInput = document.getElementById("avatar-file");
    if (!avatarFileInput?.files?.length) {
      formData.delete("file");
    }

    const templateId =
      document.querySelector(".template-selected")?.dataset.templateId;
    if (templateId) {
      formData.append("templateId", templateId);
    }

    const errorHandler = new ErrorHandler(document.getElementById("cv-form"));
    errorHandler.reset();

    try {
      const response = await Main.authFetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        errorHandler.setErrorResponse(response);
        return;
      }

      window.location.href = "/dashboard.html";
    } catch (e) {
      console.warn(e);
    }
  }

  static async renderPreview(templateId) {
    CvEditor.renderController?.abort();
    CvEditor.renderController = new AbortController();

    const iframe = document.getElementById("cv-iframe");
    if (!iframe) return;

    const form = document.getElementById("cv-form");
    const jsonData = Utils.formDataToJson(form);
    const renderObj = Utils.fromCvToRender(jsonData);
    const formData = Utils.objectToFormData(renderObj);

    const avatarFileInput = document.getElementById("avatar-file");
    const file = avatarFileInput?.files?.[0];
    if (file) {
      formData.append("file", file);
    }

    const renderRes = await fetch(
      `${APP_CONFIG.API_URL}/templates/${templateId}/render`,
      {
        method: "POST",
        body: formData,
        signal: CvEditor.renderController.signal,
      },
    );

    const errorHandler = new ErrorHandler(form);
    errorHandler.reset();

    if (!renderRes.ok) {
      errorHandler.setErrorResponse(renderRes);
      return;
    }

    const htmlContent = await renderRes.text();
    iframe.srcdoc = htmlContent;
  }

  static switchAvatarTab(tab) {
    const urlContainer = document.getElementById("avatar-url-container");
    const fileContainer = document.getElementById("avatar-file-container");
    const tabUrl = document.getElementById("tab-avatar-url");
    const tabFile = document.getElementById("tab-avatar-file");
    const avatarFileInput = document.getElementById("avatar-file");
    const avatarUrlInput = document.getElementById("avatar-url");
    const avatarPreview = document.getElementById("avatar-preview");

    if (avatarPreview) {
      avatarPreview.src = "";
      avatarPreview.style.display = "none";
    }

    if (tab === "url") {
      urlContainer.style.display = "block";
      fileContainer.style.display = "none";
      tabUrl.classList.add("active");
      tabFile.classList.remove("active");
      if (avatarFileInput) {
        avatarFileInput.value = "";
      }
    } else {
      urlContainer.style.display = "none";
      fileContainer.style.display = "block";
      tabFile.classList.add("active");
      tabUrl.classList.remove("active");
      if (avatarUrlInput) {
        avatarUrlInput.value = "";
      }
    }

    CvEditor.onRenderPreview();
  }
}

class CvFormLoader {
  static async init() {
    const params = new URLSearchParams(window.location.search);

    if (params.has("cv")) {
      CvFormLoader.uploadCv(params.get("cv"));
    } else if (params.has("draft")) {
      CvFormLoader.uploadDraft(params.get("draft"));
    }
  }

  static async uploadCv(cvId) {
    const cvResponse = await Main.authFetch(
      `${APP_CONFIG.API_URL}/cvs/${cvId}`,
      {
        method: "GET",
      },
    );

    if (!cvResponse.ok) {
      window.dispatchEvent(
        new CustomEvent("alert::show", {
          detail: {
            message: `Не вдалось завантажити резюме`,
          },
        }),
      );

      return;
    }

    const cvObj = await cvResponse?.json();

    CvFormLoader.fillFormFromCv(cvObj);
  }

  static async uploadDraft(cvId) {
    const draft = await Main.authFetch(`${APP_CONFIG.API_URL}/drafts/${cvId}`, {
      method: "GET",
    });
    const draftAsJson = await draft?.json();

    console.log("uploadDraft", draftAsJson);
  }

  static fillFormFromCv(cv) {
    const content = cv.content;

    CvFormLoader.fillStaticFields(content);
    CvFormLoader.fillExperience(content.experience);
    CvFormLoader.fillSkills(content.skills);
    CvFormLoader.fillPortfolios(content.portfolios);
    CvFormLoader.fillAvatar(cv.files);
    CvFormLoader.fillTemplate(cv.templateId);
  }

  static fillStaticFields(content) {
    const fields = {
      name: content.name,
      position: content.position,
      employmentType: content.employmentType,
      summary: content.summary,
      "contacts[email]": content.contacts?.email,
      "contacts[phone]": content.contacts?.phone,
      "contacts[location]": content.contacts?.location,
      "contacts[linkedin]": content.contacts?.linkedin,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const field = document.querySelector(`[name="${name}"]`);
      if (field) {
        field.value = value ?? "";
      }
    });
  }

  static fillExperience(experience = []) {
    const list = document.getElementById("experience-list");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    experience.forEach((item) => {
      CvEditor.addExperienceItem({
        company: item.company,
        position: item.position,
        startDate: CvFormLoader.formatMonth(item.startDate),
        endDate: CvFormLoader.formatMonth(item.endDate),
        description: item.description,
      });
    });
  }

  static fillSkills(skills = []) {
    const list = document.getElementById("skills-list");
    if (!list) {
      return;
    }

    list.innerHTML = "";

    skills.forEach((skill) => {
      CvEditor.addSkillItem(skill);
    });
  }

  static fillPortfolios(portfolios = []) {
    const list = document.getElementById("portfolio-list");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    portfolios.forEach((portfolio) => {
      CvEditor.addPortfolioItem({
        name: portfolio.name,
        url: portfolio.url,
      });
    });
  }

  static fillAvatar(files) {
    const avatarUrlInput = document.getElementById("avatar-url");
    if (!avatarUrlInput) {
      return;
    }

    const avatarId = files?.find((file) => file.category === "AVATAR")?.id;
    if (!avatarId) {
      return;
    }

    avatarUrlInput.value = `${APP_CONFIG.API_URL}/cvs/storage/published/${avatarId}`;
  }

  static formatMonth(date) {
    if (!date) {
      return "";
    }

    return date.substring(0, 7);
  }

  static fillTemplate(templateId) {
    window.addEventListener("template-render::finished", (e) => {
      TemplateContainer.markAsSelected(e.detail.container, templateId);
    });
  }
}
