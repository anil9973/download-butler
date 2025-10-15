/** @param {FileSystemDirectoryHandle} dirHandle @returns {Promise<FileSystemDirectoryHandle>} */
export async function getDirHandle(dirHandle, dirPath) {
	// if (!(await checkAccess(dirHandle))) if (!(await requestLocalDirPermission())) return;
	dirPath.endsWith("/") && (dirPath = dirPath.slice(0, -1));
	if (dirPath.includes("/")) {
		const dirPaths = dirPath.split("/");
		dirPath = dirPaths.pop();
		for (const dirName of dirPaths) dirHandle = await dirHandle.getDirectoryHandle(dirName, { create: true });
	}
	return await dirHandle.getDirectoryHandle(dirPath, { create: true });
}

/** @param {FileSystemDirectoryHandle} dirHandle */
export async function getSubFolders(dirHandle) {
	try {
		const subFolders = [];
		for await (const entry of dirHandle.values()) entry.kind === "directory" && subFolders.push(entry.name);
		return subFolders;
	} catch (error) {
		console.error(error);
	}
}

/**@param {FileSystemFileHandle} fileHandle,@param {boolean} [canRequest], @returns {Promise<ReadableStream<Uint8Array>>}*/
export async function getFileReadStream(fileHandle, canRequest) {
	try {
		/* if ((await fileHandle["queryPermission"]({ mode: "read" })) !== "granted") {
			if (!canRequest || !(await requestFilePermission(fileHandle.name.slice(0, -3)))) return;
		} */
		const file = await fileHandle.getFile();
		return file.stream();
	} catch (error) {
		console.log(error);
	}
}
