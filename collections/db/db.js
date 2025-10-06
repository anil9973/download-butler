export const Store = {
	FolderHandles: "FolderHandles",
	DownloadFiles: "Files",
};

function onupgradeneeded({ target }) {
	const folderStore = target.result.createObjectStore(Store.FolderHandles, { keyPath: "id" });
	folderStore.createIndex("fileType", "fileType", { unique: false });

	const fileStore = target.result.createObjectStore(Store.DownloadFiles, { keyPath: "id" });
	fileStore.createIndex("tags", "tags", { unique: false, multiEntry: true });
	fileStore.createIndex("folder", "folder", { unique: false });
	fileStore.createIndex("date", "date", { unique: false });
	fileStore.createIndex("domain", "domain", { unique: false });
}

/**@returns {Promise<IDBDatabase>} */
export function connect() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("DownloadButler-db", 1);
		request.onupgradeneeded = onupgradeneeded;
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		request.onblocked = () => console.warn("pending till unblocked");
	});
}
