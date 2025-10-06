import { connect, Store } from "../../collections/db/db.js";
import { Folder } from "./Folder.js";

/**@param {string} fileType, @return {Promise<Folder[]>}*/
export async function pipeFolderList(fileType) {
	if (!fileType) throw new Error("fileType required");

	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.FolderHandles, "readonly").objectStore(Store.FolderHandles);
			const fetchQuery = store.index("fileType").getAll(IDBKeyRange.only(fileType));
			fetchQuery.onsuccess = ({ target }) => resolve(target["result"]);
			fetchQuery.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {string} [fileType] @return {Promise<FileSystemDirectoryHandle[]>} */
export async function getAllFolderHandles(fileType) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.FolderHandles, "readonly").objectStore(Store.FolderHandles);
			const fetchQuery = fileType ? store.index("fileType").getAll(IDBKeyRange.only(fileType)) : store.getAll();
			fetchQuery.onsuccess = ({ target }) => resolve(target["result"].map((folder) => folder.dirHandle));
			fetchQuery.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @return {Promise<FileSystemDirectoryHandle>} */
export async function getDownloadFolderHandle(fileType = "download") {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.FolderHandles, "readonly").objectStore(Store.FolderHandles);
			const fetchQuery = store.index("fileType").get(IDBKeyRange.only(fileType));
			fetchQuery.onsuccess = ({ target }) => resolve(target["result"].dirHandle);
			fetchQuery.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @return {Promise<FileSystemDirectoryHandle>} */
export async function getFolderHandleByName(fileType, folderName) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.FolderHandles, "readonly").objectStore(Store.FolderHandles);
			const fetchQuery = store.index("fileType").getAll(IDBKeyRange.only(fileType));
			fetchQuery.onsuccess = ({ target }) =>
				resolve(target["result"].find((folder) => folder.dirHandle.name === folderName)?.dirHandle);
			fetchQuery.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {Folder} folder*/
export async function saveFolderInDb(folder) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.FolderHandles, "readwrite").objectStore(Store.FolderHandles);
			const insertTask = store.put(folder);
			insertTask.onsuccess = (e) => resolve(e);
			insertTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {Folder} folder*/
export async function updateFolderInDb(folder) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.FolderHandles, "readwrite").objectStore(Store.FolderHandles);
			const insertTask = store.put(folder);
			insertTask.onsuccess = (e) => resolve(e);
			insertTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {string} folderId*/
export async function deleteFolderInDb(folderId) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.FolderHandles, "readwrite").objectStore(Store.FolderHandles);
			const insertTask = store.delete(folderId);
			insertTask.onsuccess = (e) => resolve(e);
			insertTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}
