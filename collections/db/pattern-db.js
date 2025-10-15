import { connect, Store } from "./db.js";

/** @returns {Promise<PatternRule[]>} */
export async function getAllPatternRules() {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.PatternRules, "readonly").objectStore(Store.PatternRules);
			const fetchTask = store.getAll(null, 10);
			fetchTask.onsuccess = (evt) => resolve(evt.target["result"]);
			fetchTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {PatternRule} patternRule */
export async function insertPatternRuleInDb(patternRule) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.PatternRules, "readwrite").objectStore(Store.PatternRules);
			const putTask = store.put(patternRule);
			putTask.onsuccess = (e) => resolve(e);
			putTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** Represents a file correction record with pattern-based learning */
export class PatternRule {
	constructor(originalPath, correctedPath, patternRule, userInstruction, scope, confidence = 0) {
		this.id = Math.random().toString(36).slice(2);
		this.originalPath = originalPath;
		this.correctedPath = correctedPath;
		this.patternRule = patternRule;
		this.userInstruction = userInstruction;
		this.scope = scope;
		this.confidence = confidence;
	}
}
