import { DownloadInterceptor, DownloadsOrganizer } from "./download-interceptor.js";
import { insertCropper } from "../scripts/func-script.js";
import { injectFuncScript } from "./util.js";

globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);
globalThis.i18n = chrome.i18n.getMessage.bind(this);

getStore("organizationMethod").then(({ organizationMethod }) => setupOrganization(organizationMethod));

function setupOrganization(organizationMethod = "downloads") {
	if (organizationMethod === "downloads") {
		const downloadOrganizer = new DownloadsOrganizer();
		const onDeterminingFilename = downloadOrganizer.onDeterminingFilename.bind(downloadOrganizer);
		chrome.downloads.onDeterminingFilename.addListener(onDeterminingFilename);
	} else if (organizationMethod === "filesystem-access") {
		const downloadInterceptor = new DownloadInterceptor();
		const onCreated = downloadInterceptor.onCreated.bind(downloadInterceptor);
		chrome.downloads.onCreated.addListener(onCreated);

		const contextHandler = {
			collections: (_, tab) => chrome.tabs.create({ url: "/collections/index.html", index: tab.index + 1 }),
		};
		chrome.contextMenus.onClicked.addListener((info, tab) => contextHandler[info.menuItemId](info, tab));
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.event === "organizationMethodChange") setupOrganization(message.organizationMethod);
});

const commands = {
	screenshot: () => injectFuncScript(insertCropper),
};
chrome.commands.onCommand.addListener((cmd) => commands[cmd]?.());

export function setInstallation({ reason }) {
	async function oneTimeInstall() {
		const LAMBA_KD = crypto.randomUUID();
		await setStore({ organizationMethod: "downloads", extUserId: LAMBA_KD });

		chrome.commands.getAll(async (commands) => {
			const missingShortcuts = [];
			for (const gks of commands) gks.shortcut === "" && missingShortcuts.push(gks);
			missingShortcuts.length === 0 || (await chrome.storage.local.set({ missingShortcuts }));
			chrome.tabs.create({ url: "/guide/welcome-guide.html" });
		});
	}
	reason === "install" && oneTimeInstall();
	reason === "update" && onUpdate();

	function onUpdate() {}

	chrome.contextMenus.create({
		id: "collections",
		title: "Collections (Alt+H)",
		contexts: ["action"],
	});
}

// installation setup
chrome.runtime.onInstalled.addListener(setInstallation);
