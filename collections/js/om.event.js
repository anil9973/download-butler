// om.event.js
var funcMap = /* @__PURE__ */ new Map();
function extract(strings, ...expressions) {
	const length = expressions.length;
	const stringArr = [strings[0]];
	for (let idx = 0; idx < length; idx++) {
		const key = expressions[idx];
		if (typeof key === "function") {
			const funName = String(Math.random()).slice(9);
			funcMap.set(funName, key);
			stringArr.push(funName, strings[idx + 1]);
		} else stringArr.push(key, strings[idx + 1]);
	}
	const parseStr = "".concat(...stringArr);
	return parseStr;
}
var attrParser = {
	/**@param {Element} element, @param {NamedNodeMap} attrMap*/
	"@": (element, attr, attrMap) => {
		element.addEventListener(attr.name.slice(1), funcMap.get(attr.value));
		attrMap.removeNamedItem(attr.name);
		return true;
	},

	/**@param {Element} elem*/
	parseNodeAttr(elem) {
		const attrMap = elem.attributes;
		let i = attrMap.length;
		while (i--) this[attrMap[i].name.at(0)]?.(elem, attrMap[i], attrMap);
	},
};
function html(strings, ...expressions) {
	const htmlStr = extract(strings, ...expressions);
	const domFrag = document.createRange().createContextualFragment(htmlStr);
	for (const node of domFrag.querySelectorAll("*")) node.hasAttributes() && attrParser.parseNodeAttr(node);
	funcMap.clear();
	return domFrag;
}
export { html };
