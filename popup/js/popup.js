import "../../collections/js/reset.js";
import "../../collections/components/utils/atom-icon.js";
// import ".../../collections/components/utils/alert-toast.js";
import { DownloadingContainer } from "../components/downloading/downloading.js";
import { DownloadsManager } from "../components/downloads/downloads-manager.js";
// @ts-ignore
import baseCss from "../style/base.css" with { type: "css" };
document.adoptedStyleSheets.push(baseCss);

getStore(["userProfile", "organizationMethod"]).then(async ({ userProfile, organizationMethod }) => {
	if (!userProfile) {
		const { UserOnboardForm } = await import("../components/onboard/user-onboard-form.js");
		return document.body.appendChild(new UserOnboardForm());
	}

	if (organizationMethod === "downloads") {
		const selectElem = document.createElement("select");
		selectElem.add(new Option("Downloads Folder only", "downloads"));
		selectElem.add(new Option("File System Access API", "filesystem-access"));
		document.body.append(new Text("Choose Organization Method:"),  selectElem);
		$on(selectElem, "change", async () => {
			const { ConfirmationDialog } = await import("../components/onboard/confirmation-dialog.js");
			const organizationMethod = selectElem.value
			setStore({ organizationMethod });
			selectElem.remove();
			document.body.appendChild(new ConfirmationDialog(organizationMethod));
			chrome.runtime.sendMessage({ event: "organizationMethodChange", organizationMethod });
		});
	} else {
		const searchParams = new URLSearchParams(location.search);
		const element = searchParams.get("dwn") ? new DownloadingContainer() :new DownloadsManager(); 
		document.body.appendChild(element);
	}
});
