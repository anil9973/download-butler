import "../../collections/js/reset.js";
import "../../collections/components/utils/atom-icon.js";
// import ".../../collections/components/utils/alert-toast.js";
// @ts-ignore
import baseCss from "../style/base.css" with { type: "css" };
document.adoptedStyleSheets.push(baseCss);

// const searchParams = new URLSearchParams(location.search);


// import { UserOnboardForm } from "../components/onboard/user-onboard-form.js"; 
// document.body.appendChild(new UserOnboardForm());

import { DownloadingContainer } from "../components/downloading/downloading.js";
document.body.appendChild(new DownloadingContainer())


// import { DownloadsManager } from "../components/downloads/downloads-manager.js";
// document.body.appendChild(new DownloadsManager())