import { OpenFileRightPanel } from "../right-panel/open-file-dialog.js";
import { DownloadFile } from "../../db/DownloadFile.js";
import { FileActionMenu } from "./file-action-menu.js";
import { html } from "../../js/om.compact.js";
import { BlockLabels } from "./block-labels.js";

export class DownloadFileCard extends HTMLElement {
	/** @param {DownloadFile} downloadFile */
	constructor(downloadFile) {
		super();
		this.downloadFile = downloadFile;
	}

	openFile() {
		const fileDialog = new OpenFileRightPanel(this.downloadFile);
		document.body.appendChild(fileDialog);
	}

	openMenu({ currentTarget }) {
		currentTarget.after(new FileActionMenu(this.downloadFile));
	}

	async setThumbnail(imgElem) {
		// const srcUrl = this.image.image.srcUrl;
		// if (srcUrl.startsWith("../")) {
		// 	/* const mediaUrl = await readLocalImgFile(null, srcUrl);
		// 	imgElem.src = mediaUrl ? mediaUrl : await getBlobUrl(srcUrl.slice(3)); */
		// } else imgElem.src = await getBlobUrl(srcUrl.slice(-36));
		// imgElem.onload = () => URL.revokeObjectURL(imgElem.src);
		// async function getBlobUrl(blobId) {
		// 	const blob = await getFileById(blobId);
		// 	// @ts-ignore
		// 	return blob && URL.createObjectURL(blob);
		// }
	}

	render() {
		return html`<img src="${this.downloadFile.srcUrl}" alt="" loading="lazy" decoding="async" />
			<div class="description">${this.downloadFile.description}</div>
			<div class="action-menu-wrapper" tabindex="0">
				<atom-icon ico="menu" title="" @click=${this.openMenu.bind(this)}></atom-icon>
			</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.downloadFile.tags && this.appendChild(new BlockLabels(this.downloadFile.tags));
		// this.downloadFile.srcUrl.startsWith("http") || this.setLocalImage(this.firstElementChild);

		$on(this, "click", this.openFile);
	}
}

customElements.define("download-file-card", DownloadFileCard);
