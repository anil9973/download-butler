import { ActionSnackbar } from "../utils/action-snackbar.js";
import { deleteDwnFilesInDb } from "../../db/file-db.js";
import { DownloadFile } from "../../db/DownloadFile.js";
import { html } from "../../js/om.compact.js";

export class FileActionMenu extends HTMLElement {
	/** @param {DownloadFile} downloadFile */
	constructor(downloadFile) {
		super();
		this.downloadFile = downloadFile;
	}

	async deleteFile() {
		const deleteId = setTimeout(() => deleteDwnFilesInDb([this.downloadFile.id]).then(() => this.remove()), 5000);
		try {
			const snackElem = new ActionSnackbar();
			document.body.appendChild(snackElem);
			await snackElem.show(deleteId);
			this.hidden = true;
		} catch (error) {
			this.hidden = false;
		}
	}

	copyFile() {}

	openInLocalFolder() {}

	render() {
		return html`<li @click=${this.copyFile.bind(this)}><atom-icon ico="copy"></atom-icon> <span>Copy</span></li>
			<li @click=${this.openInLocalFolder.bind(this)}>
				<atom-icon ico="folder"></atom-icon> <span>Show in Folder</span>
			</li>
			<li @click=${this.deleteFile.bind(this)}><atom-icon ico="delete"></atom-icon> <span>Delete</span></li>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("file-action-menu", FileActionMenu);
