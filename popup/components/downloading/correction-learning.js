import { html, react } from "../../../collections/js/om.compact.js";

export class CorrectionLearning extends HTMLElement {
	constructor(suggestedPath, updatedPath, fileFormat, domain) {
		super();
		this.props = react({
			suggestedPath: suggestedPath,
			updatedPath: updatedPath,
		});
		this.fileFormat = domain;
		this.domain = domain;
	}

	learnPattern() {
		// TODO how to learn pattern
	}

	render() {
		return html`<label class="card-header">
				<atom-icon ico="robot" title=""></atom-icon>
				<span>Learning from your correction</span>
			</label>

			<section class="card">
				<div class="change-summary">
					<div class="change-row">
						<span class="label">AI suggested:</span>
						<span class="path">${() => this.props.suggestedPath}</span>
					</div>
					<div class="change-row">
						<span class="label">You chose:</span>
						<span class="path">${() => this.props.updatedPath}</span>
					</div>
				</div>
				<div class="learning-options">
					<label>
						<input type="checkbox" />
						<span>Save ${this.fileFormat} files to ${() => this.props.updatedPath}</span>
					</label>
					<label>
						<input type="checkbox" />
						<span>Files from ${this.domain} with "${this.fileFormat}" → this location</span>
					</label>
					<label>
						<input type="checkbox" />
						<span>Don't ask me again for similar files</span>
					</label>
				</div>
				<div class="dialog-actions">
					<button class="seconary">Just This Once</button>
					<button class="primary" @click=${this.learnPattern.bind(this)}>Learn This Pattern</button>
				</div>
			</section> `;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("correction-learning", CorrectionLearning);
