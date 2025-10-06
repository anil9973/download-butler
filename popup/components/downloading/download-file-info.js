import { html } from "../../../collections/js/om.compact.js";
import fileIcons from "../../../assets/file-icons.js";

export class DownloadFileInfo extends HTMLElement {
	constructor(download) {
		super();
		this.download = download;
	}

	render() {
		return html`<div class="file-info">
				${fileIcons.video}
				<div class="file-details">
					<div class="file-name">sample.pdf</div>
					<div class="file-meta"><span>email.google.com</span></div>
				</div>
				<div class="download-controller">
					<atom-icon ico="cancel" title="Cancel download"></atom-icon>
				</div>
			</div>
			<progress max="100" value="10"></progress>
			<div class="status-bar">
				<span><var>0.05MB</var>/<var>5MB</var></span>
			</div>`;
	}

	connectedCallback() {
		// this.replaceChildren(this.render());
	}
}

customElements.define("download-file-info", DownloadFileInfo);
