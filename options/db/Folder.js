export class Folder {
	constructor(id, fileType, dirHandle) {
		this.id = id;
		this.fileType = fileType;
		this.dirHandle = dirHandle;
		this.organizationRule = "";
		this.subfolderStrategy = "smart";
		this.parentFolder = "";
	}
}
