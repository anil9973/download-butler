import { html } from "../../js/om.compact.js";
// @ts-ignore
import openFileCss from "../../style/right-panel.css" with { type: "css" };
document.adoptedStyleSheets.push(openFileCss)

export class OpenFileDialog extends HTMLDialogElement {
    constructor() {
        super();
    }

    render() {
        return html``;
    }

    connectedCallback() {
        this.replaceChildren(this.render());
    }
}

customElements.define("open-file-dialog", OpenFileDialog, {extends:"dialog"});