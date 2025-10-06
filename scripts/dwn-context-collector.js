const $ = (selector, scope) => (scope || document.body).querySelector(selector);

export class DownloadContextCollector {
	constructor() {}

	/** @param {string} fileType @param {string | URL} srcUrl */
	collect(fileType, srcUrl) {
		this.fileType = fileType;
		this.context = { pageData: this.collectPageData(), surroundingContent: {} };

		const pathname = new URL(srcUrl).pathname;
		const targetAElement = $(`a[href="${srcUrl}"]`) ?? $(`a[href="${pathname}"]`);
		if (targetAElement) this.collectContextForAElem(targetAElement);
		else if (fileType === "image") {
			const targetImgElement =
				$(`img[src="${srcUrl}"]`) ??
				$(`img[src="${pathname}"]`) ??
				$(`img[srcset*="${srcUrl}"]`) ??
				$(`img[srcset*="${pathname}"]`);
			targetImgElement && this.collectContextForImgElem(targetImgElement);
		} else if (fileType === "video") {
			const targetVideoElement =
				$(`video[src="${srcUrl}"]`) ??
				$(`video[src="${pathname}"]`) ??
				$(`video:has(source[src="${srcUrl}"])`) ??
				$(`video:has(source[src="${pathname}"])`);
			targetVideoElement && this.collectContextForVideoElem(targetVideoElement);
		} else if (fileType === "audio") {
			const targetAudioElement =
				$(`audio[src="${srcUrl}"]`) ??
				$(`audio[src="${pathname}"]`) ??
				$(`audio:has(source[src="${srcUrl}"])`) ??
				$(`audio:has(source[src="${pathname}"])`);
			targetAudioElement && this.collectContextForImgElem(targetAudioElement);
		}

		return this.context;
	}

	collectContextForAElem(targetAElement) {
		targetAElement.download && (this.context.downloadAttrValue = this.extractFilename(targetAElement));

		if (this.fileType === "image" || this.fileType === "video") {
			const tagName = this.fileType === "image" ? "img" : "video";
			const figure = targetAElement.closest("figure");
			figure
				? this.collectMediaContext($(tagName, figure), figure)
				: this.getContainMediaElement(targetAElement, tagName);
		}

		this.collectSurroundingContent(targetAElement);
	}

	collectContextForImgElem(targetImgElem) {
		this.collectMediaContext(targetImgElem, targetImgElem.closest("figure"));
		this.collectSurroundingContent(targetImgElem);
	}

	collectContextForVideoElem(targetVideoElem) {
		this.collectMediaContext(targetVideoElem, targetVideoElem.closest("figure"));
		this.collectSurroundingContent(targetVideoElem);
	}

	collectContextForAudioElem(targetAudioElem) {
		this.collectMediaContext(targetAudioElem);
		this.collectSurroundingContent(targetAudioElem);
	}

	collectMediaContext(mediaElem, figureElem) {
		this.context.targetMedia = {
			type: this.fileType,
			alt: mediaElem.alt,
			className: mediaElem.className,
			caption: figureElem?.textContent.trim().slice(0, 240),
			ariaLabel: mediaElem.getAttribute("aria-label") || "",
			ariaDescribedBy: this.getAriaDescription(mediaElem),
		};
	}

	findNearestHeading(element) {
		// Look backwards in DOM for nearest heading
		let current = element;

		while (current && current !== document.body) {
			// Check previous siblings
			let sibling = current.previousElementSibling;
			while (sibling) {
				if (/^H[1-6]$/.test(sibling.tagName)) return sibling.textContent.trim();
				sibling = sibling.previousElementSibling;
			}

			// Check parent's previous siblings
			current = current.parentElement;
			if (current) {
				const heading = current.querySelector("h1, h2, h3, h4, h5, h6");
				if (heading) return heading.textContent.trim();
			}
		}

		return "";
	}

	collectSurroundingContent(triggerElement, maxDistance = 5, targetChars = 100) {
		this.context.surroundingContent = {
			textContent: "",
			heading: this.findNearestHeading(triggerElement),
		};

		// Traverse up to collect surrounding context
		let currentElement = triggerElement;
		let distance = 0;

		while (distance < maxDistance && currentElement && currentElement.parentElement) {
			currentElement = currentElement.parentElement;
			distance++;

			const textContent = currentElement.textContent.trim().replaceAll("\t", "").replaceAll("\n", "");
			if (textContent.length < 100) continue;

			this.context.surroundingContent.textContent = textContent.slice(0, 240);
			/* if (triggerElement.tagName === "A") {
				this.context.images = Array.prototype.map.call(currentElement.querySelectorAll("img"), (elem) => ({
					srcUrl: elem.currentSrc,
					alt: elem.alt,
				}));
			} */
		}
	}

	getContainMediaElement(triggerElement, tagName, maxDistance = 5) {
		// Traverse up to find first img or video element
		/* let currentElement = triggerElement;
		let distance = 0;

		while (distance < maxDistance && currentElement && currentElement.parentElement) {
			currentElement = currentElement.parentElement;
			distance++;
			
			const mediaElem = currentElement.querySelector(tagName);
			if(!mediaElem) continue

			this.collectMediaContext(mediaElem)
		} */
	}

	getAriaDescription(element) {
		const describedBy = element.getAttribute("aria-describedby");
		if (describedBy) {
			const descElement = document.getElementById(describedBy);
			return descElement?.textContent.trim() || "";
		}
		return "";
	}

	collectPageData() {
		function getMetaContent(property) {
			const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
			return meta?.["content"] || "";
		}

		return {
			url: location.href,
			domain: location.host,
			title: getMetaContent("og:title") || document.title,
			description: getMetaContent("og:description") || getMetaContent("description"),
			author: getMetaContent("author"),
		};
	}

	extractFilename(element) {
		const download = element.getAttribute("download");
		if (download) return download;

		const href = element.href || "";
		const urlParts = href.split("/");
		return urlParts[urlParts.length - 1] || "download";
	}
}
