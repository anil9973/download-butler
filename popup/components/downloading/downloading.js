import { DownloadFileInfo } from "./download-file-info.js";
import { FilePathSegments } from "./file-path-segments.js";
import { CorrectionLearning } from "./correction-learning.js";
import { DownloadRulePrompts } from "./download-rule-prompts.js";
// @ts-ignore
import downloadingCss from "../../style/downloading.css" with { type: "css" };
document.adoptedStyleSheets.push(downloadingCss);

export class DownloadingContainer extends HTMLElement {
	constructor() {
		super();
	}

	onPathUpdate({ detail: updatedPath }) {
		if (!this.learningElem) {
			const fileFormat = "proposal";
			const domain = "email.google.com";
			this.learningElem = new CorrectionLearning(this.suggestedPath, updatedPath, fileFormat, domain);
			this.appendChild(this.learningElem);
		} else this.learningElem.props.updatedPath = updatedPath;

		this.port?.postMessage({ event: "pathupdate", folderPath: updatedPath });
	}

	onUserInstruction({ detail: instruction }) {
		this.port?.postMessage({ event: "instruction", instruction });
	}

	render(fileType) {
		return [
			new DownloadFileInfo(),
			new FilePathSegments(fileType, this.suggestedPath),
			new DownloadRulePrompts(fileType),
		];
	}

	connectedCallback() {
		this.port = chrome.runtime.connect({ name: "download" });
		this.port.onMessage.addListener((msg) => {
			this.suggestedPath = msg.folderPath;
			this.replaceChildren(...this.render(msg.fileType));

			$on(this.children[1], "pathupdate", this.onPathUpdate.bind(this));
			$on(this.children[2], "instruction", this.onUserInstruction.bind(this));
		});
	}
}

customElements.define("downloading-container", DownloadingContainer);
