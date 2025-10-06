import { getDownloadFolderHandle, getFolderHandleByName } from "../options/db/folder-db.js";
import { collectDataForFSADownloadFile } from "../scripts/func-script.js";
import { insertFileInCollectionDb } from "../collections/db/file-db.js";
import { FolderTreeBuilder } from "./folder-tree-builder.js";
import { DownloadFile } from "../collections/db/DownloadFile.js";
import { generateFileMetadata } from "../AI/ai.js";
import { PromptBuilder } from "./prompt-builder.js";
import { getCrtTab, injectFuncScript } from "./util.js";

export class FSADownloadManager {
	constructor() {}

	userProfession;
	promptBuilder;
	folderTreeBuilder;
	folderTree;

	/** @param {chrome.downloads.DownloadItem} item */
	async startDownload(item) {
		this.userProfession ??= (await getStore("userProfile")).userProfile.profession;
		this.promptBuilder ??= new PromptBuilder();
		this.folderTreeBuilder ??= new FolderTreeBuilder();
		this.folderTree ??= []; // Fetch from indexdb directory

		try {
			const downloadPromise = this.downloadFile(item);
			const fileType = item.mime.slice(0, item.mime.indexOf("/"));
			const srcContext = await injectFuncScript(collectDataForFSADownloadFile, null, fileType, item.url);
			const folderTree = await this.folderTreeBuilder.build(fileType);
			const promptText = this.promptBuilder.build(srcContext, this.userProfession, folderTree);
			const fileMetaData = await generateFileMetadata(promptText);
			// TODO when need to open popup
			await this.openPopup(fileType, null);

			this.fileHandle = await Promise.any([downloadPromise]);
			await this.moveFile(this.fileHandle, fileType, fileMetaData.folderPath);
			await insertFileInCollectionDb(new DownloadFile(fileType, item.url, fileMetaData, item.referrer));
		} catch (error) {
			console.error(error);
			// chrome.downloads.download({ url:item.url, saveAs: true });
		}
	}

	/** @param {string} fileType @param {string} folderPath */
	async openPopup(fileType, folderPath) {
		chrome.runtime.onConnect.addListener((port) => {
			port.onMessage.addListener((msg) => {
				if (msg.event === "pathupdate") this.moveFile(this.fileHandle, fileType, msg.folderPath);
				if (msg.event === "instruction") {
					//TODO AI generated path based on user instruction
					this.moveFile(this.fileHandle, fileType, msg.folderPath);
				}
			});
			port.postMessage({ fileType, folderPath });
			this.port = port;
		});

		const tabId = (await getCrtTab()).id;
		await chrome.action.setPopup({ popup: `popup/index.html?dwn=${fileType}`, tabId });
		await chrome.action.openPopup();
		chrome.action.setPopup({ popup: "popup/index.html", tabId });
	}

	async downloadFile(item) {
		const dirHandle = await getDownloadFolderHandle();
		const filename = this.getFilenameFromUrl(item.url);

		/* return new Promise(async (resolve, reject) => {
			const filePath = dirHandle.name + "/" + filename;
			const downloadId = await chrome.downloads.download({ url: item.url, filename: filePath, saveAs: false });

			async function onDownloadUpdate(delta) {
				if (delta.id === downloadId && delta.state?.current === "complete") {
					const [download] = await chrome.downloads.search({ id: downloadId });
					const fileHandle = await dirHandle.getFileHandle(download.filename);
					chrome.downloads.onChanged.removeListener(onDownloadUpdate);
					resolve(fileHandle);
				}
			}
			chrome.downloads.onChanged.addListener(onDownloadUpdate);
		}); */

		const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
		await this.writeToLocalFile(item.url, fileHandle);
		return fileHandle;
	}

	/** @param {URL | RequestInfo} srcUrl @param {FileSystemFileHandle} fileHandle */
	async writeToLocalFile(srcUrl, fileHandle) {
		try {
			/**@type {FileSystemWritableFileStream} */
			const writableStream = await fileHandle.createWritable();
			const response = await fetch(srcUrl);
			if (response.ok && response.body) {
				await response.body.pipeTo(writableStream);
			} else console.error("failed to fetch");
		} catch (error) {
			console.error(error);
		}
	}

	/** @param {FileSystemFileHandle} fileHandle @param {string} fileType @param {string} folderPath */
	async moveFile(fileHandle, fileType, folderPath) {
		const rootDirName = folderPath.slice(0, folderPath.indexOf("/"));
		const rootDirHandle = await getFolderHandleByName(fileType, rootDirName); // Fetch from indexdb
		fileHandle["move"](rootDirHandle);
	}

	/** @param {FileSystemDirectoryHandle} dirHandle @returns {Promise<FileSystemFileHandle>} */
	async getFileHandle(dirHandle, filePath, create = true) {
		// if (!(await checkAccess(dirHandle))) if (!(await requestLocalDirPermission())) return;
		if (filePath.includes("/")) {
			const dirPaths = filePath.split("/");
			filePath = dirPaths.pop();
			for (const dirName of dirPaths) dirHandle = await dirHandle.getDirectoryHandle(dirName, { create: true });
		}
		return await dirHandle.getFileHandle(filePath, { create });
	}

	getFilenameFromUrl(url) {
		const escapeRx = new RegExp(/[\s:|?<>/~#^*\[\]]/g);
		const pathname = new URL(url).pathname;
		return pathname.slice(pathname.lastIndexOf("/") + 1).replaceAll(escapeRx, "");
	}
}
