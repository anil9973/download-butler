import { html } from "../../../collections/js/om.compact.js";
import { ComparisonTable } from "./comparison-table.js";
// @ts-ignore
import onboardCss from "../../style/user-onboard.css" with { type: "css" };

const professions = [
	{ value: "developer", text: "Web Developer" },
	{ value: "designer", text: "Designer" },
	{ value: "writer", text: "Writer" },
	{ value: "marketer", text: "Marketing Professional" },
	{ value: "researcher", text: "Researcher" },
	{ value: "student", text: "Student" },
	{ value: "manager", text: "Manager" },
	{ value: "other", text: "Professional" },
];

export class UserProfile {
	constructor() {
		this.profession = "";
		this.organizationMethod = "downloads";
	}
}

export class UserOnboardForm extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [onboardCss];
		this.userProfile = new UserProfile();

		document.body.style.minWidth = "43rem";
	}

	onProfessionUpdate({ target }) {
		if (target.value === "other") this.shadowRoot.children[3]["hidden"] = false;
		this.userProfile.profession = target.value;
		setStore({ userProfile: this.userProfile });
	}

	render() {
		const item = (item, index) =>
			html`<li class="chip-item" style="--hue:${index * 40}">
				<label><input type="radio" name="profession" value="${item.value}" hidden /><span>${item.text}</span></label>
			</li>`;

		return html`<h2 style="margin-block:0.4em;text-align:center">Welcome to DownloadButler</h2 style="margin-block:0.5em" >
		<div>Your Profession</div>
		<ul class="professions" @change=${this.onProfessionUpdate.bind(this)}>
			${professions.map(item)}
		</ul>
		<input type="text" name="profession" hidden />
		<button type="submit" @click=${this.remove.bind(this)}>Get Started</button>`;
	}

	connectedCallback() {
		this.shadowRoot.replaceChildren(this.render());
		const comparisonTable = new ComparisonTable();
		this.shadowRoot.lastElementChild.before(comparisonTable);

		$on(comparisonTable, "change", ({ target }) => {
			this.userProfile.organizationMethod = target.value;
			setStore({ userProfile: this.userProfile });
		});
	}
}

customElements.define("user-onboard-form", UserOnboardForm);
