import { DownloadFileCard } from "../blockcards/file-card.js";
import { pipeDownloadFileList } from "../../db/file-db.js";
import { DownloadFile } from "../../db/DownloadFile.js";
// @ts-ignore
import containerCss from "../../style/category-container.css" with { type: "css" };
import blockLabelCss from "../../style/block-labels.css" with { type: "css" };
document.adoptedStyleSheets.push(containerCss, blockLabelCss);

const folderPaths = (await getStore("folderPaths")).folderPaths ?? {};

export class CategoryContainer extends HTMLElement {
	constructor() {
		super();
	}

	/**@param {Map<string, DownloadFile[]>} collectionMap*/
	render(collectionMap) {
		const docFrag = new DocumentFragment();
		collectionMap.forEach((collections, key) => {
			const categoryItem = document.createElement("category-item");
			const labelElem = document.createElement("category-label");
			labelElem.textContent = this.viewMode === "folder" ? (folderPaths[key] ?? key) : key;
			const collectionsBox = document.createElement("category-collectionbox");
			//biome-ignore format:
			collectionsBox.append(...collections.map((downloadFile) => new DownloadFileCard(downloadFile)));
			categoryItem.append(labelElem, collectionsBox);
			docFrag.append(categoryItem);
		});

		return docFrag;
	}

	async connectedCallback() {
		const replaceViewCollections = async (viewMode, filter) => {
			this.viewMode = viewMode;
			localStorage.setItem("viewMode", viewMode);
			try {
				const collectionMap = await pipeDownloadFileList(viewMode, filter);
				this.replaceChildren(this.render(collectionMap));
			} catch (error) {
				console.error(error);
				// document.body.appendChild(new ReportBug(error));
			}
		};
		replaceViewCollections("date");
		$on(document.body, "viewmodechange", ({ detail }) => replaceViewCollections(detail));
		$on(document.body, "viewmodefilter", ({ detail }) => replaceViewCollections(this.viewMode, detail));
	}
}

customElements.define("category-container", CategoryContainer);
