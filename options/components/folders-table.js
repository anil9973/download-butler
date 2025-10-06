import { deleteFolderInDb, pipeFolderList, saveFolderInDb, updateFolderInDb } from "../db/folder-db.js";
import { AtomIcon } from "../../collections/components/utils/atom-icon.js";
import { html } from "../../collections/js/om.compact.js";
import { Folder } from "../db/Folder.js";
import { StartIn } from "../js/constant.js";

export class FolderRow extends HTMLTableRowElement {
	/** @param {Folder} folder */
	constructor(folder) {
		super();
		this.folder = folder;
	}

	async deleteFolder() {
		await deleteFolderInDb(this.folder.id);
		this.remove();
	}

	async updateFolder({ target }) {
		if (!target.name) return;
		if (target.name === "name") return;

		this.folder[target.name] = target.value;
		await updateFolderInDb(this.folder);
	}

	createSelect(value) {
		const options = [
			{ name: "Smart (AI decides depth)", value: "smart" },
			{ name: "Flat (no subfolders)", value: "flat" },
			{ name: "Date-based (YYYY/MM)", value: "date" },
		];
		const select = document.createElement("select");
		select.name = "subfolderStrategy";
		select.value = value;
		for (const option of options) select.add(new Option(option.name, option.value));
		return select;
	}

	createTextarea(value) {
		const textarea = document.createElement("textarea");
		textarea.name = "organizationRule";
		textarea.placeholder = "Organization rule";
		textarea.value = value;
		return textarea;
	}

	createParentFolderInput(value) {
		const input = document.createElement("input");
		input.type = "text";
		input.name = "parentFolder";
		input.placeholder = "parent folder path";
		input.value = value;
		return input;
	}

	createNameInput(value) {
		const input = document.createElement("input");
		input.type = "text";
		input.name = "name";
		input.placeholder = "name";
		input.value = value;
		input.spellcheck = false;
		return input;
	}

	render() {
		this.insertCell().appendChild(this.createNameInput(this.folder.dirHandle.name));
		this.insertCell().appendChild(this.createTextarea(this.folder.organizationRule));
		this.insertCell().appendChild(this.createSelect(this.folder.subfolderStrategy));
		this.insertCell().appendChild(this.createParentFolderInput(this.folder.parentFolder));
		this.insertCell().appendChild(new AtomIcon("delete"));
	}

	connectedCallback() {
		this.render();
		$on(this, "change", this.updateFolder.bind(this));
		$on(this.lastElementChild, "click", this.deleteFolder.bind(this));
	}
}

customElements.define("folder-row", FolderRow, { extends: "tr" });

export class FoldersTable extends HTMLElement {
	constructor(fileType) {
		super();
		this.fileType = fileType;
	}

	async pickFolder() {
		try {
			const startIn = StartIn[this.fileType];
			const id = Math.random().toString(36).slice(2);
			// @ts-ignore
			const dirHandle = await showDirectoryPicker({ id, mode: "readwrite", startIn });
			const folder = new Folder(id, this.fileType, dirHandle);
			await saveFolderInDb(folder);
			$("tbody", this).appendChild(new FolderRow(folder));
		} catch (error) {
			console.error(error);
		}
	}

	render() {
		return html`<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Organization Rule</th>
						<th>Subfolder Strategy</th>
						<th>Parent Folder</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					${this.folders.map((folder) => new FolderRow(folder))}
				</tbody>
			</table>
			<button @click=${this.pickFolder.bind(this)}>
				<atom-icon ico="folder-plus" title=""></atom-icon>
				<span>Add Folder</span>
			</button>`;
	}

	async connectedCallback() {
		this.folders = await pipeFolderList(this.fileType);
		this.replaceChildren(this.render());
	}
}

customElements.define("folders-table", FoldersTable);
