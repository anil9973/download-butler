import { html } from "../../../collections/js/om.compact.js";
import { ConfirmationDialog } from "./confirmation-dialog.js";
import { ComparisonTable } from "./comparison-table.js";
// @ts-ignore
import onboardCss from "../../style/user-onboard.css" with { type: "css" };

const professions = [
	{ value: "developer", text: "Software Developer" },
	{ value: "devops_enginner", text: "DevOps Enginner" },
	{ value: "designer", text: "Designer" },
	{ value: "student", text: "Student" },
	{ value: "teacher", text: "Teacher" },
	{ value: "researcher", text: "Researcher" },
	{ value: "marketer", text: "Marketing Professional" },
	{ value: "writer", text: "Writer" },
	{ value: "manager", text: "Manager" },
	{ value: "medicial", text: "Medicial" },
	{ value: "photographer", text: "Photographer" },
	{ value: "data_scientist", text: "Data Scientist" },
	{ value: "video_editor", text: "Video Editor" },
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

	onSubmit() {
		this.remove();
		console.log(this.organizationMethod);
		document.body.appendChild(new ConfirmationDialog(this.organizationMethod));
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
		<button type="submit" @click=${this.onSubmit.bind(this)}>Get Started</button>`;
	}

	connectedCallback() {
		this.shadowRoot.replaceChildren(this.render());
		const comparisonTable = new ComparisonTable();
		this.shadowRoot.lastElementChild.before(comparisonTable);

		$on(comparisonTable, "change", ({ target }) => {
			this.organizationMethod = target.value;
			setStore({ organizationMethod: this.organizationMethod });
			chrome.runtime.sendMessage({ event: "organizationMethodChange", organizationMethod: this.organizationMethod });
		});
	}
}

customElements.define("user-onboard-form", UserOnboardForm);
