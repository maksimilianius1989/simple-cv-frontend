class DraftForm {
  static getDraftFormTemplate() {
   const template = document.getElementById('draft-form-template');
    return template.content.cloneNode(true);
  }

  static sendDraftData() {
    const promptGroup = document.getElementById("promptGroup");
    const promptTextarea = document.getElementById("promptTextarea");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const filePreview = document.getElementById("filePreview");
    const fileName = document.getElementById("fileName");
    const removeFileBtn = document.getElementById("removeFileBtn");
    const btnGenerate = document.getElementById("btnGenerate");

    let selectedFiel = null;
  }
}
