import { html } from "../../../collections/js/om.compact.js";

export class ConfirmationDialog extends HTMLElement {
	constructor(organizationMethod) {
		super();
		this.organizationMethod = organizationMethod;
	}

	render() {
		return html`<div class="main-container">
			<div class="status-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
					<defs>
						<mask id="SVGKkdZ2csA">
							<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
								<path
									fill="#fff"
									stroke="#fff"
									d="m24 4l5.253 3.832l6.503-.012l1.997 6.188l5.268 3.812L41 24l2.021 6.18l-5.268 3.812l-1.997 6.188l-6.503-.012L24 44l-5.253-3.832l-6.503.012l-1.997-6.188l-5.268-3.812L7 24l-2.021-6.18l5.268-3.812l1.997-6.188l6.503.012z" />
								<path stroke="#000" d="m17 24l5 5l10-10" />
							</g>
						</mask>
					</defs>
					<path fill="#42ff00" d="M0 0h48v48H0z" mask="url(#SVGKkdZ2csA)" />
				</svg>
			</div>

			<h1>DownloadButler is Active</h1>
			<p>Your downloads will be automatically organized</p>
		</div>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.organizationMethod === "filesystem-access" ? chrome.runtime.openOptionsPage() : setTimeout(() => close(), 3000);
	}
}

customElements.define("confirmation-dialog", ConfirmationDialog);
