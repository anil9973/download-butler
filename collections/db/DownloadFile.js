const rdmHue = () => Math.floor(Math.random() * 18) * 20;
const mapLabels = (labels) => labels.map((label) => ({ color: rdmHue(), name: label }));

export class DownloadFile {
	/** @param {string} type  @param {string} srcUrl  @param {string} pageUrl */
	constructor(type, srcUrl, fileMetadata, pageUrl) {
		this.id = crypto.randomUUID();
		this.fileType = type;

		this.date = new Date().toLocaleDateString("default", { day: "2-digit", month: "long", year: "numeric" });

		this.srcUrl = srcUrl;
		this.pageUrl = pageUrl;
		this.title = fileMetadata.filename;
		this.description = fileMetadata.description;
		// this.thumbnail = thumbnail; // TODO need to generate thumbnail
		this.tags = mapLabels(fileMetadata.tags);

		this.createdAt = new Date().toISOString();
		this.updatedAt = null;

		this.setDomain(pageUrl);
		addDateInCollection();
	}

	setDomain(pageUrl) {
		if (!URL.canParse(pageUrl)) return;
		const url = new URL(pageUrl);
		this.domain = url.host;
		this.route = get2RoutePath(url);
		addDomainInCollection(url, this.route);
	}

	async setFolder(...categories) {
		const folders = (await getStore("folders")).folders ?? { root: [] };
		let parentId = "root";
		for (const folderName of categories) {
			const idx = folders[parentId]?.findIndex((item) => item.name === folderName);
			folders[parentId] ??= [];
			let folder;
			if (idx === -1) {
				folder = { id: Math.random().toString(36).slice(2), name: folderName };
				folders[parentId].push(folder);
				parentId = folder.id;
			} else if (parentId && folders[parentId].findIndex((item) => item.name === folderName) === -1) {
				folder = folders[parentId].splice(idx, 1)[0];
				folders[parentId].push(folder);
				parentId = folder.id;
			}
			await setStore({ folders });
		}

		this.folder = parentId;
	}
}

//prettier-ignore
const languageCodes = new Set(["ar", "cs", "da", "de", "en", "es", "fr","hi", "it", "iw", "ja", "ko", "pl", "pt", "ru", "sk","sv", "tr","th", "uk","zh"]);

/** @param {URL} url*/
export function get2RoutePath(url) {
	const path = url.pathname.endsWith("/") ? url.pathname.slice(1, -1) : url.pathname.slice(1);
	const parts = path.split("/");
	languageCodes.has(parts[0].split("-")[0]) && parts.shift();
	return parts.length > 2 ? parts.slice(0, 2).join("/") : parts[0];
}

function getWeek(day) {
	let weekNum = 1;
	day > 7 && day <= 14
		? (weekNum = 2)
		: day > 7 && day <= 14
		? (weekNum = 2)
		: day > 14 && day <= 21
		? (weekNum = 3)
		: day > 21 && (weekNum = 4);
	return "week " + weekNum;
}

export async function addDateInCollection() {
	const collectionCalendar = (await chrome.storage.local.get("collectionCalendar"))["collectionCalendar"] ?? {};
	const date = new Date().toLocaleDateString("default", { day: "numeric", month: "long", year: "numeric" });
	const month = date.slice(2);
	collectionCalendar[month] ??= [];

	const day = +date.slice(0, 2);
	const week = getWeek(day);
	const idx = collectionCalendar[month].indexOf(week);
	if (idx !== -1) return;

	collectionCalendar[month].push(week);
	chrome.storage.local.set({ collectionCalendar });
}

export async function addDomainInCollection(url, route) {
	const domain = url.host;
	const domains = (await getStore("domains"))["domains"] ?? {};
	const tab = await (await chrome.tabs.query({ url: url.href }))[0];

	const urlPath = url.host === "www.youtube.com" ? url.searchParams.get("v") : url.pathname;
	domains[domain] ??= { favIconUrl: tab?.favIconUrl, name: domain, routes: {} };
	domains[domain].routes[route] ??= [];
	if (domains[domain].routes[route].indexOf(urlPath) !== -1) return;
	domains[domain].routes[route].push(urlPath);
	await setStore({ domains });
}
