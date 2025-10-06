export const getCrtTab = async () => (await chrome.tabs.query({ currentWindow: true, active: true }))[0];

export function getDateTimeName() {
	return new Date()
		.toLocaleString("default", { dateStyle: "medium", timeStyle: "short" })
		.replaceAll(" ", "-")
		.replaceAll(",", "")
		.replaceAll(":", "_");
}

export function extractJSONContent(markText) {
	markText = markText.trim();
	let jsonStartIndex = markText.indexOf("```json");
	if (jsonStartIndex === -1) return markText;

	jsonStartIndex = jsonStartIndex + 7;
	const blockEndIndex = markText.indexOf("```", jsonStartIndex);
	const jsonContent = markText.slice(jsonStartIndex, blockEndIndex);
	return JSON.parse(jsonContent.trim());
}

/**@param {(...args: any[]) => any} func*/
export async function injectFuncScript(func, tabId, ...args) {
	tabId ??= (await getCrtTab()).id;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			func: func,
			args: args,
		});
		return results[0].result;
	} catch (error) {
		console.warn(error);
	}
}
