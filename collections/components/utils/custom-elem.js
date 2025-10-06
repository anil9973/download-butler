export class TextSpan extends HTMLSpanElement {
	constructor(text = "") {
		super();
		this.text = new Text(text);
	}

	connectedCallback() {
		this.replaceChildren(this.text);
	}
}

customElements.define("text-span", TextSpan, { extends: "span" });
