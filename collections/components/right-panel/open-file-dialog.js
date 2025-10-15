import { getFileReadStream } from "../../../popup/js/file-handle.js";
import { DownloadFile } from "../../db/DownloadFile.js";
import { html } from "../../js/om.compact.js";
// @ts-ignore
import openFileCss from "../../style/right-panel.css" with { type: "css" };
document.adoptedStyleSheets.push(openFileCss);

export class OpenFileRightPanel extends HTMLDialogElement {
	/** @param {DownloadFile} filedata */
	constructor(filedata) {
		super();
		this.filedata = filedata;
	}

	contents = {
		image: () => html`<img src="${this.filedata.srcUrl}" decoding="async" />`,
		video: () => html`<video src="${this.filedata.srcUrl}" decoding="async"></video>`,
		pdf: () => html`<object type="application/pdf" data="${this.filedata.srcUrl}" decoding="async"></object>`,
	};

	async loadTextFileContent() {
		// const fileHandle = // TODO
		const fileStream = await getFileReadStream(fileHandle, true);
	}

	render() {
		return this.contents[this.filedata.fileType]?.() ?? "";
	}

	async connectedCallback() {
		this.replaceChildren(this.render());
		$on(this,"close",()=> this.remove());
	}
}

customElements.define("open-file-dialog", OpenFileRightPanel, { extends: "dialog" });
