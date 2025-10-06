import { BlockLabels } from "./block-labels.js";
import { html } from "../../js/om.compact.js";

export class DownloadFileCard extends HTMLElement {
	constructor(downloadFile) {
		super();
		this.downloadFile = downloadFile;
	}

	openFile() {}

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
			<atom-icon ico="delete" title="" style="bottom:0.5em"></atom-icon>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.downloadFile.tags && this.appendChild(new BlockLabels(this.downloadFile.tags));
		// this.downloadFile.srcUrl.startsWith("http") || this.setLocalImage(this.firstElementChild);
	}
}

customElements.define("download-file-card", DownloadFileCard);
