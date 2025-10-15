import { pipeFolderList } from "../options/db/folder-db.js";

export class SubFolder {
	/**@param {string} name, @param {string} [path] */
	constructor(name, path) {
		this.name = name;
		// this.path = path;
		this.subFolders = [];
	}
}

export class FolderTreeBuilder {
	constructor() {}

	/** @param {string} fileType */
	async build(fileType) {
		const keyName = fileType + "FolderTree";
		// const { [keyName]: cacheFolderTree } = await getStore(keyName); // CUrrently disable for testing
		// if (Array.isArray(cacheFolderTree) && cacheFolderTree.length !== 0) return cacheFolderTree;

		const folders = await pipeFolderList(fileType);
		const promises = folders.map(async (folder) => {
			const subFolders = await this.createFolderTree(folder.dirHandle);
			return {
				name: folder.dirHandle.name,
				path: folder.parentFolder ?? "" + "/" + folder.dirHandle.name,
				organizationRule: folder.organizationRule,
				subfolderStrategy: folder.subfolderStrategy,
				subFolders: subFolders,
			};
		});

		const folderTree = await Promise.all(promises);
		await setStore({ [keyName]: folderTree });
		return folderTree;
	}

	/** @param {FileSystemDirectoryHandle} dirHandle */
	async createFolderTree(dirHandle) {
		try {
			const dirTree = [];
			let promises = [];
			async function walkDir(dirHandle, openDir, dirPath) {
				for await (const entry of dirHandle.values()) {
					if (entry.kind === "directory") {
						// const entryPath = (dirPath && dirPath + "/") + entry.name;
						const subFolder = new SubFolder(entry.name);
						openDir.push(subFolder);
						promises.push(walkDir(entry, subFolder.subFolders));
					} else {
						// TODO file count
					}
				}
			}

			promises.push(walkDir(dirHandle, dirTree, ""));
			await Promise.all(promises);
			await new Promise((r) => setTimeout(r, 100)); //FIX later
			return dirTree;
		} catch (error) {
			console.error(error);
		}
	}
}
