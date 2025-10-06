/** @param {FileSystemDirectoryHandle} dirHandle @returns {Promise<FileSystemDirectoryHandle>} */
export async function getDirHandle(dirHandle, dirPath) {
	// if (!(await checkAccess(dirHandle))) if (!(await requestLocalDirPermission())) return;
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
