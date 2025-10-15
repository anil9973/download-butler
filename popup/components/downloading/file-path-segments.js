import { getAllFolderHandles, getFolderHandleByName } from "../../../options/db/folder-db.js";
import { html, map, react } from "../../../collections/js/om.compact.js";
import { getDirHandle, getSubFolders } from "../../js/file-handle.js";

export class FilePathSegments extends HTMLElement {
	/**
	 * @param {string} fileType
	 * @param {string} folderPath
	 * @param {import("./downloading.js").UserLearningInstruction} userCorrections
	 */
	constructor(fileType, folderPath, userCorrections) {
		super();
		this.fileType = fileType;
		this.pathSegments = react(folderPath.split("/"));
		this.userCorrections = userCorrections;
	}

	updateFolderPath() {
		const updatedFolderPath = this.pathSegments.join("/");
		this.userCorrections.selectedPath = updatedFolderPath;
		chrome.storage.session.set({ userCorrections: { selectedPath: updatedFolderPath } });
		fireEvent(this, "pathupdate");
		setTimeout(() => close(), 1000);
	}

	render() {
		return html`<label class="card-header">
				<atom-icon ico="folder-open" title=""></atom-icon>
				<span>Save location</span>
				<atom-icon
					ico="done"
					title=""
					style="float: right"
					@click=${this.updateFolderPath.bind(this)}
					hidden></atom-icon>
			</label>
			<ul>
				${this.pathSegments.map((pathSegment) => new PathSegment(pathSegment, this.fileType))}
			</ul>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		$onO(this.lastElementChild, "change", (e) => (this.firstElementChild.lastElementChild["hidden"] = false));
	}
}

customElements.define("file-path-segments", FilePathSegments);

export class PathSegment extends HTMLElement {
	/** @param {string} pathSegment @param {string} fileType */
	constructor(pathSegment, fileType) {
		super();
		this.name = "path-segment";
		this.fileType = fileType;
		this.pathSegment = pathSegment;
		this.segmentOptions = react([]);
	}

	dirHandle;

	async fetchOptions() {
		/** @type {PathSegment} */
		// @ts-ignore
		const rootFolderElem = this.parentElement.firstElementChild;
		if (rootFolderElem === this) {
			const rootDirHandles = await getAllFolderHandles(this.fileType);
			return rootDirHandles.map((dirHandle) => dirHandle.name);
		} else {
			rootFolderElem.dirHandle ??= await getFolderHandleByName(this.fileType, rootFolderElem.pathSegment);
			if (rootFolderElem.nextElementSibling === this) return getSubFolders(rootFolderElem.dirHandle);
			const index = Array.prototype.indexOf.call(this.parentElement.children, this);
			const dirPath = this.parentElement.parentElement["pathSegments"].slice(1, index).join("/");
			return getSubFolders(await getDirHandle(rootFolderElem.dirHandle, dirPath));
		}
	}

	async showOptions() {
		const options = await this.fetchOptions();
		this.segmentOptions.push(...options);
	}

	updatePathSegment(pathSegment) {
		const index = Array.prototype.indexOf.call(this.parentElement.children, this);
		this.parentElement.parentElement["pathSegments"][index] = pathSegment;
	}

	onChange({ target }) {
		this.updatePathSegment(target.value);
	}

	onClick({ target }) {
		const liElem = target.closest("li");
		if (!liElem) return;

		const pathSegment = liElem.textContent.trim();
		this.firstElementChild["value"] = pathSegment;
		this.firstElementChild.dispatchEvent(new Event("change", { bubbles: true }));
	}

	render() {
		const item = (option) => html`<li>${option}</li>`;
		return html`<input type="text" value="${this.pathSegment}" @change=${this.onChange.bind(this)} />
			<menu tabindex="0" @click=${this.onClick.bind(this)}> ${map(this.segmentOptions, item)} </menu>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		$onO(this.firstElementChild, "focus", this.showOptions.bind(this));
	}
}

customElements.define("path-segment", PathSegment);
