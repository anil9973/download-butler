/**
 * @param {string} fileType
 * @param {string} srcUrl
 */
export async function collectDataForDownloadFile(fileType, srcUrl) {
	const { DownloadContextCollector } = await import(chrome.runtime.getURL("scripts/dwn-context-collector.js"));
	return new DownloadContextCollector().collect(fileType, srcUrl);
}

export async function collectDataForFSADownloadFile(fileType, srcUrl) {
	const { DownloadContextCollector } = await import(chrome.runtime.getURL("scripts/dwn-context-collector.js"));
	return new DownloadContextCollector().collect(fileType, srcUrl);
}

export async function extractPageThumbnail() {
	const meta1 = document.head.querySelector('meta[name="description"]');
	const description = meta1?.["content"] || document.title;

	const meta2 =
		document.head.querySelector('meta[property="og:image"]') ||
		document.head.querySelector('meta[name="twitter:image"]');
	return [description, meta2?.["content"]];
}

export async function insertCropper() {
	const { createCropUI } = await import(chrome.runtime.getURL("/scripts/screenshot/crop-box.js"));
	const shotCropper = await createCropUI();
	document.body.appendChild(shotCropper);
}
