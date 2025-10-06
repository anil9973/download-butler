import { DownloadFile } from "./DownloadFile.js";
import { getFilterKeyRange } from "./helper.js";
import { connect, Store } from "./db.js";

/**
 * @param {string} viewMode
 * @param {string} [filter]
 * @returns {Promise<Map<String, DownloadFile[]>>}
 */
export async function pipeDownloadFileList(viewMode, filter) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const dwnFileMap = new Map();
			const transaction = db.transaction(Store.DownloadFiles, "readonly");
			const dwnFileStore = transaction.objectStore(Store.DownloadFiles);
			const storeIdx = dwnFileStore.index(viewMode);
			const fetchCursor = storeIdx.openCursor(getFilterKeyRange(viewMode, filter), "prev");

			fetchCursor.onsuccess = (event) => {
				const cursor = event.target["result"];
				if (cursor) {
					const dwnFile = cursor.value;
					dwnFileMap.has(cursor.key)
						? dwnFileMap.get(cursor.key).push(dwnFile)
						: dwnFileMap.set(cursor.key, [dwnFile]);
					cursor.continue();
				} else resolve(dwnFileMap);
			};
			fetchCursor.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {DownloadFile} block */
export async function insertFileInCollectionDb(block) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.DownloadFiles, "readwrite").objectStore(Store.DownloadFiles);
			const putTask = store.put(block);
			putTask.onsuccess = (e) => resolve(e);
			putTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {DownloadFile} blockData */
export async function updateDwnFileInDb(blockData) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.DownloadFiles, "readwrite").objectStore(Store.DownloadFiles);
			const archiveTask = store.put(blockData);
			archiveTask.onsuccess = (e) => resolve(e);
			archiveTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/**@param {Set<string>|string[]} dwnFileIds*/
export async function deleteDwnFilesInDb(dwnFileIds) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const transaction = db.transaction(Store.DownloadFiles, "readwrite");
			const blockStore = transaction.objectStore(Store.DownloadFiles);
			for (const blockId of dwnFileIds) blockStore.delete(blockId);
			transaction.oncomplete = (e) => resolve(e);
			transaction.onerror = (e) => reject(e);
			db.close();
		});
	});
}
