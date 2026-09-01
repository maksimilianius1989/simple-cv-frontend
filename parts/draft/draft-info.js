class DraftInfo {
  constructor(draft) {
    const template = document.getElementById("draft-info-template");
    this.template = template.content.cloneNode(true);
    this.draft = draft;
    this.previewLink = this.template.querySelector(".draft-preview-link");
    this.preview = this.template.querySelector(".draft-preview");
    this.name = this.template.querySelector(".content-name");
    this.position = this.template.querySelector(".content-position");
    this.summary = this.template.querySelector(".content-summary");
    this.coverLetter = this.template.querySelector(".content-cover-letter");
    this.prompt = this.template.querySelector(".draft-prompt");
    this.provider = this.template.querySelector(".draft-ai-provider");

    this.init();
  }

  init() {
    const previewId = this.draft.files?.find(
      (file) => file.category === "PREVIEW",
    )?.id;
    if (previewId) {
      this.previewLink.href = `${APP_CONFIG.API_URL}/cvs/storage/published/${previewId}`;
      Main.uploadAuthImg(`${APP_CONFIG.API_URL}/cvs/storage/${previewId}`, this.preview);
    }

    this.name.textContent = this.draft?.content?.name;
    this.position.textContent = this.draft?.content?.position;
    this.summary.textContent = this.draft?.content?.summary;
    this.coverLetter.textContent = this.draft?.content?.coverLetter;
    this.prompt.textContent = this.draft.prompt;
    this.provider.textContent = this.draft.provider;
  }

  getDraftInfoTemplate() {
    return this.template;
  }
}
