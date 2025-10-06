import { html } from "../../../collections/js/om.compact.js";

export class ComparisonTable extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		return html`<div class="recommended">🌟 Recommended</div>
			<table>
				<thead>
					<tr>
						<th>Feature</th>
						<th>
							<label>
								<input type="radio" name="organization-method" value="downloads" checked />
								<span>Downloads Folder Only</span>
							</label>
						</th>
						<th>
							<label>
								<input type="radio" name="organization-method" value="filesystem-access" />
								<strong>Filesystem Access API</strong>⭐
							</label>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><strong>Setup Complexity</strong></td>
						<td>Low (automatic)</td>
						<td title="Grants access to selected folders (one-time)">Medium (folder selection)</td>
					</tr>
					<tr>
						<td><strong>AI Intelligence</strong></td>
						<td>Basic (no context)</td>
						<td><strong>High (folder tree awareness)</strong></td>
					</tr>
					<tr>
						<td><strong>Download Speed</strong></td>
						<td title="Delayed (20-30s wait for AI suggestion)">Delayed 20-30s ⏱️</td>
						<td title="Immediate download, then async move/organize"><strong>Immediate ⚡</strong></td>
					</tr>
					<tr>
						<td><strong>Folder Decision</strong></td>
						<td title="Limited—AI guesses/creates new; no full existing tree scan">Create new blindly</td>
						<td title="Full tree sent to AI for smart reuse/creation of folders">
							<strong>Use existing or create smart</strong>
						</td>
					</tr>
					<tr>
						<td><strong>Bulk Operations</strong></td>
						<td title="Not supported (one-at-a-time)">❌ No</td>
						<td title="Yes—organize/rename multiple files at once">
							<strong>✅ Yes - organize existing files</strong>
						</td>
					</tr>
					<tr>
						<td><strong>System Folders</strong></td>
						<td title="Nested subfolders inside Downloads only (e.g., Downloads/Work/Reports/)">❌ Only Downloads</td>
						<td title="Anywhere on system (e.g., Pictures, Documents, custom projects)">
							<strong>✅ Pictures, Videos, Documents</strong>
						</td>
					</tr>
					<tr>
						<td><strong>Collections/Search</strong></td>
						<td>Limited</td>
						<td title="Collections panel with AI summaries, hashtags; prompt-based rule">
							<strong>✅ Full metadata &amp; summaries</strong>
						</td>
					</tr>
					<tr>
						<td><strong>User Control</strong></td>
						<td>Less flexible</td>
						<td><strong>✅ Multiple root folders per type</strong></td>
					</tr>
					<tr>
						<td><strong>Best For</strong></td>
						<td>Quick setup, minimal permissions</td>
						<td><strong>Power users, professionals</strong></td>
					</tr>
				</tbody>
			</table>
			<label style="display:block;margin-top:0.5em">
				<span>Choose Organization Method: </span>
				<select id="mode-select">
					<option value="downloads">Downloads Folder only</option>
					<option value="filesystem-access">File System Access API</option>
				</select>
			</label> `;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("comparison-table", ComparisonTable);
