class ModalManager {
  static EVENT_MODAL_OPEN = "modal::open";
  static EVENT_MODAL_CLOSE = "modal::close";

  constructor() {
    this.init();
    this.addEventListeners();
  }

  init() {
    this.modal = document.getElementById("modal-window");
    this.badge = document.querySelector(".modal-badge");
    this.title = document.querySelector(".modal-title");
    this.subtitle = document.querySelector(".modal-subtitle");
    this.body = document.querySelector(".modal-body");
    this.closeBtn = document.querySelector(".modal-close-btn");
  }

  addEventListeners() {
    window.addEventListener(ModalManager.EVENT_MODAL_OPEN, this.openModal);
    window.addEventListener(ModalManager.EVENT_MODAL_CLOSE, this.closeModal);

    this.modal.addEventListener("click", this.handleOverlayClick);
    this.closeBtn?.addEventListener("click", this.closeModal);
  }

  handleOverlayClick = (event) => {
    if(event.target === this.modal) {
      this.closeModal();
    }
  }

  openModal = (payload) => {
    if (!this.body) this.init();

    const data =
      payload?.detail || (payload instanceof Event ? {} : payload) || {};
    const { badgeText, titleText, subtitleText, contentHtml, ttl} = data;

    if (this.badge) {
      this.badge.textContent = badgeText || "💬 Simple CV Life";
    }

    if (this.title) this.title.textContent = titleText || "";
    if (this.subtitle) this.subtitle.textContent = subtitleText || "";
    if (this.body) this.body.innerHTML = contentHtml || "";

    this.modal.classList.add("active");

    if(ttl) {
      setTimeout(this.closeModal, ttl * 1000);
    }
  };

  closeModal = () => {
    this.modal?.classList.remove("active");
  };
}

document.addEventListener("DOMContentLoaded", () => new ModalManager());
