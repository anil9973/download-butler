import { AtomIcon } from "../../../collections/components/utils/atom-icon.js";
import { TextSpan } from "../../../collections/components/utils/custom-elem.js";
import { DownloadFileInfo } from "../downloading/download-file-info.js";
import { html } from "../../../collections/js/om.compact.js";
// @ts-ignore
import downloadsCss from "../../style/dwn-manager.css" with { type: "css" };
document.adoptedStyleSheets.push(downloadsCss);

export class DatewiseDownloadList extends HTMLElement {
	constructor(downloads, date) {
		super();
		this.downloads = downloads;
		this.date = date;
	}

	render() {
		return html`<div>${this.date}</div>
        <ul>${this.downloads.map((download)=> new DownloadFileInfo(download))}</ul>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("datewise-downloads", DatewiseDownloadList);

export class DownloadsManager extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		const downloadMap = new Map([["Today", [{}, {}]], ["Yesterday", [{}, {}]]]);
		const elements = [];
		downloadMap.forEach((downloads, date) => elements.push(new DatewiseDownloadList(downloads, date)));
		return elements;
	}

	connectedCallback() {
		this.replaceChildren(...this.render());

        const button = document.createElement("button");
        button.append(new AtomIcon("collection"), new TextSpan("Open collections"))
        this.after(button)
	}
}

customElements.define("downloads-manager", DownloadsManager);
