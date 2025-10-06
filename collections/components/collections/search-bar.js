import { html } from "../../js/om.compact.js";
import { StringSearch } from "../../js/boyer-moore.js";
// @ts-ignore
import searchCss from "../../style/search-bar.css" with { type: "css" };

export class SearchBar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [searchCss];

		// @ts-ignore
		this.highlighter = new Highlight();
		CSS["highlights"].set("search-highlight", this.highlighter);
	}

	reset() {
		this.inputField.value = "";
		this.highlighter.clear();
		for (const collectionCard of this.blockCards) collectionCard.hidden && (collectionCard.hidden = false);
	}

	/**@param {number[]} offsets, @param {Node} txtNode*/
	highlightMatchRange(offsets, txtNode) {
		const length = this.inputField.value.length;
		for (const offset of offsets) {
			const range = new Range();
			range.setStart(txtNode, offset);
			range.setEnd(txtNode, offset + length);
			this.highlighter.add(range);
		}
	}

	/**@param {StringSearch} searcher*/
	searchCollectionContent(searcher) {
		this.highlighter.clear();
		for (const blockCard of this.blockCards) {
			const collectionContent = blockCard.lastElementChild.textContent;
			const offsets = searcher.searchAll(collectionContent);
			// const txtNode = blockCard.lastElementChild.lastElementChild.previousElementSibling.firstChild;

			if (offsets[0]) {
				blockCard.hidden &&= false;
				//TODO this.highlightMatchRange(offsets, txtNode);
			} else {
				blockCard.hidden = true;
			}
		}
	}

	searchCollection() {
		const needle = this.inputField.value;
		if (needle) {
			const searcher = new StringSearch(needle);
			this.searchCollectionContent(searcher);
		} else this.reset();
	}

	onSearchFocus() {
		/**@type {HTMLElement[]} */
		// @ts-ignore
		this.blockCards = document.body.querySelectorAll("category-collectionbox > *");
	}

	render() {
		return html`<search>
				<input
					type="search"
					placeholder="🔍 ${i18n("search_collection")}"
					ref=${(node) => (this.inputField = node)}
					@focus=${this.onSearchFocus.bind(this)}
					@input=${this.searchCollection.bind(this)}
					@blur=${this.reset.bind(this)} />
				<atom-icon ico="search"></atom-icon>
			</search>
			<atom-icon ico="sort" @click=${this.sortCollections.bind(this)}></atom-icon>`;
	}

	connectedCallback() {
		this.shadowRoot.replaceChildren(this.render());
	}

	sortCollections() {
		const categoryContainer = this.nextElementSibling;
		categoryContainer["style"].flexDirection =
			categoryContainer["style"].flexDirection === "column-reverse" ? "column" : "column-reverse";
	}
}

customElements.define("search-bar", SearchBar);
