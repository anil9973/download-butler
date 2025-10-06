import { FileFormatList } from "./file-types.js";
import { FoldersTable } from "./folders-table.js";
import { PermissionDialog } from "./permission-dialog.js";

export class FoldersContainer extends HTMLElement {
	constructor() {
		super();
	}

	render(fileType) {
		return [new FileFormatList(), new FoldersTable(fileType)];
	}

	async connectedCallback() {
		const fileType = localStorage.getItem("lastFileType") ?? "download";
		this.replaceChildren(...this.render(fileType));
		this.after(new PermissionDialog());

		for (const fileTypeElem of this.firstElementChild.children) {
			if (fileTypeElem["fileFormat"].fileType !== fileType) continue;
			return (fileTypeElem["open"] = true);
		}
	}
}

customElements.define("fileformats-folders-container", FoldersContainer);
