import { html } from "../../../collections/js/om.compact.js";

export class CorrectionLearning extends HTMLElement {
	/**
	 * @param {string} suggestedPath
	 * @param {string} fileType
	 * @param {string} domain
	 * @param {import("./downloading.js").UserLearningInstruction} userCorrections
	 */
	constructor(suggestedPath, fileType, domain, userCorrections) {
		super();
		this.suggestedPath = suggestedPath;
		this.userCorrections = userCorrections;
		this.fileType = fileType;
		this.domain = domain;
	}

	/** @param {"learn_pattern" | "apply_rule"} action  */
	onBtnClick(action) {
		this.userCorrections.action = action;
		fireEvent(this, "btnclick");
	}

	render() {
		const rules = this.userCorrections.rules;
		return html`<label class="card-header">
				<atom-icon ico="robot" title=""></atom-icon>
				<span>Learning from your correction</span>
			</label>

			<section class="card">
				<div class="change-summary">
					<div class="change-row">
						<span class="label">AI suggested:</span>
						<span class="path">${this.suggestedPath}</span>
					</div>
					<div class="change-row">
						<span class="label">You choose:</span>
						<span class="path">${() => this.userCorrections.selectedPath}</span>
					</div>
				</div>
				<div class="learning-options">
					<label>
						<input type="checkbox" ?checked=${() => rules.applyToFileType} />
						<span>Save ${this.fileType} files to ${() => this.userCorrections.selectedPath}</span>
					</label>
					<label>
						<input type="checkbox" ?checked=${() => rules.applyToDomain} />
						<span>Files from ${this.domain} with "${this.fileType}" → this location</span>
					</label>
					<label>
						<input type="checkbox" ?checked=${() => rules.dontAskAgain} />
						<span>Don't ask me again for similar files</span>
					</label>
				</div>
				<div class="dialog-actions">
					<button class="seconary" @click=${this.onBtnClick.bind(this, "just_once")}>Just This Once</button>
					<button class="primary" @click=${this.onBtnClick.bind(this, "learn_pattern")}>Learn This Pattern</button>
				</div>
			</section> `;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("correction-learning", CorrectionLearning);
