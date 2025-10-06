import { html } from "../../collections/js/om.compact.js";
import { FoldersTable } from "./folders-table.js";

import fileFormats from "../../assets/file-formats.json" with { type:"json" }

export class FileFormat extends HTMLDetailsElement {
	constructor(fileFormat) {
		super();
		this.fileFormat = fileFormat;
		this.name = "file-format";
	}

	render() {
		const item = (fileExt, index) => html`<li class="chip-item" style="--hue:${index * 20}">${fileExt}</li>`;
		return html`<summary>${this.fileFormat.name}</summary>
			<ul>
				${this.fileFormat.fileExtensions.map(item)}
			</ul>`;	
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		$on(this, "toggle", (evt) => {
			if(evt.newState !== "open") return
			this.parentElement.nextElementSibling.replaceWith(new FoldersTable(this.fileFormat.fileType));
			localStorage.setItem("lastFileType", this.fileFormat.fileType);
		});
	}
}

customElements.define("file-format", FileFormat, { extends: "details" });

export class FileFormatList extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		return fileFormats.map((fileFormat) => new FileFormat(fileFormat));
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
	}
}

customElements.define("file-format-list", FileFormatList);
