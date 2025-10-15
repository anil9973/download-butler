import { collectDataForDownloadFile } from "../scripts/func-script.js";
import { FSADownloadManager } from "./fsa-download-manager.js";
import { injectFuncScript } from "./util.js";
import { aiService } from "../AI/ai.js";

/** @description when organization method = "downloads". Determining filename by AI */
export class DownloadsOrganizer {
	constructor() {}

	async generateFilePath(fileData, pageData) {
		try {
			return await aiService.getFileMetadata(fileData, pageData);
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
		const fileType = item.mime.slice(0, item.mime.indexOf("/"));
		const fileData = { filename: item.filename, mime: item.mime, srcUrl: item.url, referrerUrl: item.referrer };
		injectFuncScript(collectDataForDownloadFile, null, fileType, item.url).then((pageData) => {
			this.generateFilePath(fileData, pageData).then((filename) => suggest({ filename, conflictAction: "uniquify" }));
		});
		return true;
	}
}

export class DownloadInterceptor {
	constructor() {}

	/** @param {chrome.downloads.DownloadItem} downloadItem */
	async onCreated(downloadItem) {
		if (this.fsaDownloadManager?.fsaSrcUrl === downloadItem.url) return;
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
