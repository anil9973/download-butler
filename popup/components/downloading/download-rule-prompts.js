import { html } from "../../../collections/js/om.compact.js";

export class DownloadRulePromptField extends HTMLElement {
	/** @param {string} fileType @param {import("./downloading.js").UserLearningInstruction} userCorrections */
	constructor(fileType, userCorrections) {
		super();
		this.fileType = fileType;
		this.userCorrections = userCorrections;
	}

	async saveInstruction({ currentTarget }) {
		const instruction = currentTarget.previousElementSibling.textContent.trim();
		const userInstructions = (await getStore("userInstructions")).userInstructions ?? {};
		userInstructions[this.fileType].push(instruction);
		this.userCorrections.instruction = instruction;
		await setStore({ userInstructions });
		await chrome.storage.session.set({ userCorrections: { instruction: instruction } });
		fireEvent(this, "instruction");
	}

	async startMicRecording() {
		//TODO
	}

	render(instructionPrompts = []) {
		const placeholder =
			"For PDF files from 'acme.com', save to 'Documents/Clients/Acme' and name the file '[YYYY-MM-DD]_[Original Filename]'";

		return html`<div class="or">Or,</div>
			<label class="card-header">
				<atom-icon ico="routes" title=""></atom-icon>
				<span>How should we handle similar files in the future?</span>
				<atom-icon
					ico="done"
					title=""
					style="float: right"
					@click=${this.saveInstruction.bind(this)}
					hidden></atom-icon>
			</label>
			<section>
				<prompt-field>
					<blockquote contenteditable="plaintext-only" placeholder="${placeholder}"></blockquote>
					<atom-icon ico="mic" title="" @click=${this.saveInstruction.bind(this)}></atom-icon>
				</prompt-field>
				<ul>
					${instructionPrompts.map((prompt) => html`<li class="chip-item">${prompt}</li>`)}
				</ul>
			</section>`;
	}

	async connectedCallback() {
		const userInstructions = (await getStore("userInstructions")).userInstructions ?? {};
		this.replaceChildren(this.render(userInstructions[this.fileType]));
		// $('atom-icon[ico="mic"]', this).ico = "send"; // Temp till mic implement
	}
}

customElements.define("download-rule-prompt-field", DownloadRulePromptField);
