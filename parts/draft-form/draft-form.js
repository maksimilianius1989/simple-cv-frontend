class DraftForm {
    static getDraftFormTemplate() {
        const template = document.getElementById('draft-form-template');
        return template.content.cloneNode(true);
    }
}
