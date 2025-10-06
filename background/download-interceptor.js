import { collectDataForDownloadFile } from "../scripts/func-script.js";
import { FSADownloadManager } from "./fsa-download-manager.js";
import { injectFuncScript } from "./util.js";

/** @description when organization method = "downloads". Determining filename by AI */
export class DownloadsOrganizer {
	constructor() {
		getStore("userProfile").then(({ userProfile }) => (this.userProfile = userProfile.profession));
	}

	buildPromptText(srcUrl, pageData) {
		return `Generate category for file: ${srcUrl}
		User Profession: ${this.userProfile}
		PageData: ${JSON.stringify(pageData)}`;
	}

	async generateFilePath(message) {
		try {
			/* const response = await this.generateFileMetadata(message);
			return extractJSONContent(response); */
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * @param {chrome.downloads.DownloadItem} item
	 * @param {(arg0: { filename: string; conflictAction: string; }) => void} suggest
	 */
	onDeterminingFilename(item, suggest) {
		if (item.byExtensionId === chrome.runtime.id) return;
		injectFuncScript(collectDataForDownloadFile).then((pageData) => {
			const promptText = this.buildPromptText(item.url, pageData);
			this.generateFilePath(promptText).then((filename) => suggest({ filename, conflictAction: "uniquify" }));
		});

		return true;
	}
}

export class DownloadInterceptor {
	constructor() {}

	/** @param {chrome.downloads.DownloadItem} downloadItem */
	async onCreated(downloadItem) {
		try {
			await chrome.downloads.cancel(downloadItem.id);
			await chrome.downloads.erase({ id: downloadItem.id });
		} catch (error) {
			return console.error("Failed to cancel download:", error); // Let Chrome handle it
		}

		//TODO start download via FSA
		this.fsaDownloadManager = new FSADownloadManager();
		this.fsaDownloadManager.startDownload(downloadItem);
	}
}
