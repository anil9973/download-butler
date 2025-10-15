import { getDownloadFolderHandle, getFolderHandleByName } from "../options/db/folder-db.js";
import { insertPatternRuleInDb, PatternRule } from "../collections/db/pattern-db.js";
import { collectDataForFSADownloadFile } from "../scripts/func-script.js";
import { insertFileInCollectionDb } from "../collections/db/file-db.js";
import { fixFilename, getCrtTab, injectFuncScript } from "./util.js";
import { DownloadFile } from "../collections/db/DownloadFile.js";
import { FolderTreeBuilder } from "./folder-tree-builder.js";
import { aiService } from "../AI/ai.js";
import { getDirHandle } from "../popup/js/file-handle.js";

export class FSADownloadManager {
	constructor() {}

	folderTreeBuilder;
	folderTree;

	/** @param {chrome.downloads.DownloadItem} item */
	async startDownload(item) {
		this.folderTreeBuilder ??= new FolderTreeBuilder();

		try {
			const downloadPromise = this.downloadFile(item);
			const fileType = item.mime.slice(0, item.mime.indexOf("/"));
			const filename = this.getFilenameFromUrl(item.url);
			const fileData = { filename, mime: item.mime, srcUrl: item.url, referrerUrl: item.referrer };
			const srcContext = await injectFuncScript(collectDataForFSADownloadFile, null, fileType, item.url);
			const folderTree = await this.folderTreeBuilder.build(fileType);
			const fileMetaData = await aiService.generateFileMetadata(fileData, srcContext, folderTree);
			const needToOpenPopup = await this.shouldShowPopup(fileMetaData.confidence, fileType);
			if (needToOpenPopup) {
				try {
					const url = srcContext.pageData.url || item.referrer || (await getCrtTab()).url;
					const domain = URL.canParse(url) ? new URL(url).hostname : "None";
					const response = await this.openPopup(fileType, fileMetaData.folderPath, domain);
					if (response?.selectedPath || response?.instruction) {
						//prettier-ignore
						fileMetaData.folderPath = await this.handleUserCorrection( fileData, srcContext, folderTree, fileMetaData, response.selectedPath, response.instruction );
					}
				} catch (error) {
					console.error(error);
				}
			}

			this.fileHandle = await Promise.any([downloadPromise]);
			await this.moveFile(this.fileHandle, fileType, fileMetaData.folderPath, fileMetaData.filename);
			await insertFileInCollectionDb(new DownloadFile(fileType, item.url, fileMetaData, item.referrer));
		} catch (error) {
			console.error(error);
		}
	}

	async downloadFile(item) {
		const dirHandle = await getDownloadFolderHandle();
		const filename = this.getFilenameFromUrl(item.url);
		const isInDownloadFolder = false;
		if (!dirHandle) throw new Error("Downloads folder required");

		const browserDownload = () => {
			return new Promise(async (resolve, reject) => {
				try {
					this.fsaSrcUrl = item.url;
					const filePath = dirHandle.name + "/" + filename;
					const downloadId = await chrome.downloads.download({
						url: item.url,
						filename: filePath,
						saveAs: false,
					});
					this.fsaSrcUrl = null;

					async function onDownloadUpdate(delta) {
						if (delta.id === downloadId && delta.state?.current === "complete") {
							const [download] = await chrome.downloads.search({ id: downloadId });
							const fileHandle = await dirHandle.getFileHandle(fixFilename(filename), { create: true });
							if (!fileHandle) resolve(await writeToFile());
							chrome.downloads.onChanged.removeListener(onDownloadUpdate);
							resolve(fileHandle);
						}
					}
					chrome.downloads.onChanged.addListener(onDownloadUpdate);
				} catch (error) {
					reject(error);
				}
			});
		};

		const writeToFile = async () => {
			const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
			await this.writeToLocalFile(item.url, fileHandle);
			return fileHandle;
		};

		return isInDownloadFolder ? await browserDownload() : await writeToFile();
	}

	/** @param {number} confidence @param {any} fileData */
	async shouldShowPopup(confidence, fileData, settings) {
		// Force show conditions
		if (confidence < 0.6) return true; // 0.75 (Low for testing)
		//   if (settings.alwaysConfirm) return true;

		// Throttle by checking cache
		const cacheKey = `shown_${fileData.type}_${fileData.domain}_${new Date().getDate()}`;
		const { hasShownToday } = await chrome.storage.session.get(cacheKey);

		if (!hasShownToday) {
			await chrome.storage.session.set({ [cacheKey]: "true" });
			return true;
		}

		return false;
	}

	/** @param {string} fileType @param {string} folderPath */
	async openPopup(fileType, folderPath, domain) {
		return new Promise(async (resolve, reject) => {
			try {
				chrome.runtime.onConnect.addListener((port) => {
					port.onMessage.addListener((msg) => {
						if (msg.userCorrections) resolve(msg.userCorrections);
					});
					port.postMessage({ fileType, folderPath, domain });
					port.onDisconnect.addListener(async () => {
						const { userCorrections } = await chrome.storage.session.get("userCorrections");
						resolve(userCorrections);
					});
					this.port = port;
				});

				const tabId = (await getCrtTab()).id;
				await chrome.action.setPopup({ popup: `popup/index.html?dwn=${fileType}`, tabId });
				await chrome.action.openPopup();
				chrome.action.setPopup({ popup: "popup/index.html", tabId });
			} catch (error) {
				reject(error);
			}
		});
	}

	async handleUserCorrection(
		fileData,
		srcContext,
		folderTree,
		originalSuggestion,
		userSelectedPath,
		userInstruction
	) {
		const refinedResult = await aiService.processUserInstruction(
			fileData,
			srcContext,
			folderTree,
			originalSuggestion,
			userSelectedPath,
			userInstruction
		);

		// Check if we should create a learning pattern
		if (refinedResult.learningData.createPattern) {
			const patternRule = new PatternRule(
				originalSuggestion.folderPath,
				refinedResult.folderPath,
				refinedResult.learningData.patternRule,
				refinedResult.userIntent.ruleDescription,
				refinedResult.userIntent.scope,
				refinedResult.confidence
			);
			insertPatternRuleInDb(patternRule);

			// Notify user that pattern was learned
			/* this.showNotification({
				title: "Pattern Learned! 🧠",
				message: refinedResult.userIntent.ruleDescription,
				type: "success",
			}); */
		}

		return refinedResult.folderPath;
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
	async moveFile(fileHandle, fileType, folderPath, filename) {
		const index = folderPath.indexOf("/");
		const rootDirName = folderPath.slice(0, index);
		const rootDirHandle = await getFolderHandleByName(fileType, rootDirName); // Fetch from indexdb
		const dirHandle = await getDirHandle(rootDirHandle, folderPath.slice(index + 1));
		fileHandle["move"](dirHandle, filename);
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
