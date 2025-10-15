import { DownloadFile } from "../../../collections/db/DownloadFile.js";
import { html } from "../../../collections/js/om.compact.js";
import fileIcons from "../../../assets/file-icons.js";
import { deleteDwnFilesInDb } from "../../../collections/db/file-db.js";

export class DownloadFileInfo extends HTMLElement {
	/** @param {DownloadFile} fileData */
	constructor(fileData) {
		super();
		this.fileData = fileData;
	}

	async deleteFile() {
		await deleteDwnFilesInDb([this.fileData.id]);
	}

	render() {
		const status = "downloaded";
		const progressBar = () => html`<progress max="100" value="10"></progress>
			<div class="status-bar">
				<span><var>0.05MB</var>/<var>5MB</var></span>
			</div>`;
		return html`<div class="file-info">
				${fileIcons.video}
				<div class="file-details">
					<div class="row">
						<div class="file-name">${this.fileData.title}</div>
						<atom-icon ico="delete" title="" @click=${this.deleteFile.bind(this)}></atom-icon>
					</div>
					<div class="row">
						<div class="file-meta"><span>${this.fileData.domain}</span></div>
						<atom-icon ico="folder" title=""></atom-icon>
					</div>
				</div>

				<div class="download-controller">
					${status === "downloaded" ? "" : html`<atom-icon ico="cancel" title="Cancel download"></atom-icon>`}
				</div>
			</div>
			${status === "downloaded" ? "" : progressBar()} `;
	}

	connectedCallback() {
		this.fileData && this.replaceChildren(this.render());
	}
}

customElements.define("download-file-info", DownloadFileInfo);
