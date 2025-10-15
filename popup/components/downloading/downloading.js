import { DownloadFileInfo } from "./download-file-info.js";
import { FilePathSegments } from "./file-path-segments.js";
import { CorrectionLearning } from "./correction-learning.js";
import { react } from "../../../collections/js/om.compact.js";
import { DownloadRulePromptField } from "./download-rule-prompts.js";
// @ts-ignore
import downloadingCss from "../../style/downloading.css" with { type: "css" };
document.adoptedStyleSheets.push(downloadingCss);

export class DownloadingContainer extends HTMLElement {
	constructor() {
		super();
		/** @type {UserLearningInstruction} */
		this.userCorrections = react({
			selectedPath: "",
			instruction: "",
			rules: {
				applyToFileType: true,
				applyToDomain: false,
				dontAskAgain: true,
			},

			action: "learn_pattern",
		});
	}

	sendInstruction() {
		console.log(this.userCorrections);
		this.port?.postMessage({userCorrections:this.userCorrections});
	}

	onInstructionUpdate(fileType, domain) {
		if (this.learningElem) return;
		this.learningElem = new CorrectionLearning(this.suggestedPath, fileType, domain, this.userCorrections);
		this.appendChild(this.learningElem);
		$on(this.learningElem, "btnclick", this.sendInstruction.bind(this));
	}

	render(fileType) {
		return [
			new DownloadFileInfo(),
			new FilePathSegments(fileType, this.suggestedPath, this.userCorrections),
			new DownloadRulePromptField(fileType, this.userCorrections),
		];
	}

	connectedCallback() {
		this.port = chrome.runtime.connect({ name: "download" });
		this.port.onMessage.addListener((msg) => {
			this.suggestedPath = msg.folderPath;
			this.replaceChildren(...this.render(msg.fileType));

			$on(this.children[1], "pathupdate", this.onInstructionUpdate.bind(this, msg.fileType, msg.domain));
			$on(this.children[2], "instruction", this.onInstructionUpdate.bind(this, msg.fileType, msg.domain));
		});
	}
}

customElements.define("downloading-container", DownloadingContainer);

/**
 * @typedef {Object} UserLearningInstruction
 * @property {string} selectedPath - The file or folder path selected by the user for applying the action.
 * @property {string} instruction - The user’s natural language instruction or command.
 * @property {Object} rules - Configuration for how the rule or pattern should be applied.
 * @property {boolean} rules.applyToFileType - Whether to apply this learning rule to all files of the same type.
 * @property {boolean} rules.applyToDomain - Whether to apply this rule only within the current domain or source.
 * @property {boolean} rules.dontAskAgain - If true, skips confirmation prompts for future similar cases.
 * @property {"learn_pattern"|"apply_rule"|"ignore"} action - Type of learning or operation to perform.
 */
