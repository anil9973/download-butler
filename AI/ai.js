import { getAllPatternRules } from "../collections/db/pattern-db.js";
import { initializeApp, getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "./firebase-ai.js";
import { PromptBuilder } from "./prompt-builder.js";

const firebaseConfig = {
	apiKey: "AIzaSyCmzT3-QYthsF_wI7PXykFbxWsgYfdLAPA",
	authDomain: "downloadbutler.firebaseapp.com",
	projectId: "downloadbutler",
	storageBucket: "downloadbutler.firebasestorage.app",
	messagingSenderId: "101548496483",
	appId: "1:101548496483:web:02be9fb17ce2d1e4e54a56",
	measurementId: "G-98BMNZ195G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize the Google AI service.
const googleAI = getAI(app, { backend: new GoogleAIBackend() });

export class AiService {
	constructor() {
		this.promptBuilder = new PromptBuilder();
	}
	userProfession;

	async initialize() {
		// Create a `GenerativeModel` instance with a model that supports your use case.
		this.model = getGenerativeModel(googleAI, { mode: InferenceMode.ONLY_IN_CLOUD });
	}

	/**
	 * Get AI-based action suggestions for File system access
	 * @param {import("./prompt-builder.js").FileMetadata} fileData
	 * @param {import("./prompt-builder.js").PageContext} srcContext
	 * @param {any[]} folderTree
	 * @return {Promise<FileOrganizationSuggestion>}
	 */
	async generateFileMetadata(fileData, srcContext, folderTree) {
		this.model ?? (await this.initialize());
		this.userProfession ??= (await getStore("userProfile")).userProfile?.profession;
		const learningPatterns = await getAllPatternRules();
		const promptText = this.promptBuilder.build(
			fileData,
			srcContext,
			folderTree,
			this.userProfession,
			learningPatterns
		);

		try {
			const result = await this.model.generateContent(promptText);
			const response = await result.response.text();
			return extractJSONContent(response);
		} catch (err) {
			console.warn("AI suggestions failed:", err);
		}
	}

	/**
	 * Process user's instruction and get refined path
	 * @param {import("./prompt-builder.js").FileMetadata} fileData
	 * @param {import("./prompt-builder.js").PageContext} srcContext
	 * @param {any[]} folderTree
	 * @param {FileOrganizationSuggestion} originalSuggestion
	 * @param {string} userSelectedPath
	 * @param {string} userInstruction
	 * @return {Promise<FileOrganizationResult>}
	 */
	async processUserInstruction(
		fileData,
		srcContext,
		folderTree,
		originalSuggestion,
		userSelectedPath,
		userInstruction
	) {
		this.model ?? (await this.initialize());
		this.userProfession ??= (await getStore("userProfile")).userProfile?.profession;
		const promptText = this.promptBuilder.buildUserInstructionPrompt(
			fileData,
			srcContext,
			folderTree,
			this.userProfession,
			originalSuggestion,
			userSelectedPath,
			userInstruction
		);

		try {
			const result = await this.model.generateContent(promptText);
			const response = await result.response.text();
			return extractJSONContent(response);
		} catch (err) {
			console.warn("AI suggestions failed:", err);
		}
	}

	/**
	 * @description For downloads
	 * @param {import("./prompt-builder.js").FileMetadata} fileData
	 * @param {import("./prompt-builder.js").PageContext} pageData
	 */
	async getFileMetadata(fileData, pageData) {
		this.model ?? (await this.initialize());
		this.userProfession ??= (await getStore("userProfile")).userProfile?.profession;
		const promptText = this.promptBuilder.buildForDownloadsFolder(fileData, pageData, this.userProfession);

		try {
			const result = await this.model.generateContent(promptText);
			return await result.response.text().trim();
		} catch (err) {
			console.warn("AI suggestions failed:", err);
		}
	}
}

export const aiService = new AiService();

/** @param {string} markText*/
function extractJSONContent(markText) {
	markText = markText.trim();
	if (markText.startsWith("{") && markText.startsWith("}")) return JSON.parse(markText);
	let jsonStartIndex = markText.indexOf("```json");
	if (jsonStartIndex === -1) return markText;

	jsonStartIndex = jsonStartIndex + 7;
	const blockEndIndex = markText.indexOf("```", jsonStartIndex);
	const jsonContent = markText.slice(jsonStartIndex, blockEndIndex);
	return JSON.parse(jsonContent.trim());
}

/**
 * @typedef {Object} FileOrganizationSuggestion
 * @property {string} folderPath - Suggested folder path for saving the file (e.g., "Documents/Projects/ClientName/").
 * @property {string} filename - Suggested filename for the file.
 * @property {string[]} tags - List of descriptive tags or hashtags related to the file content.
 * @property {string} description - Short description of the file or its purpose.
 * @property {number} confidence - Confidence score (0–1) representing how certain the AI/system is about this suggestion.
 * @property {string} reasoning - Explanation or logic behind the suggested organization.
 */

/**
 * @typedef {Object} FileOrganizationResult
 * @property {string} folderPath - Final or suggested folder path for saving the file.
 * @property {string} filename - Suggested filename for the file (with extension).
 * @property {string[]} tags - List of descriptive tags or hashtags related to the file.
 * @property {string} description - Short description summarizing the file purpose or content.
 * @property {number} confidence - Confidence score (0–1) indicating how reliable the suggestion is.
 * @property {string} reasoning - Explanation or logic behind the generated organization.
 *
 * @property {Object} userIntent - Describes user's intent or rules for file organization.
 * @property {boolean} userIntent.wantsRule - Whether the user wants to create or apply a persistent rule.
 * @property {string} userIntent.ruleDescription - Human-readable description of the intended organization rule.
 * @property {string} userIntent.appliesTo - Pattern describing what files this rule applies to (e.g., "invoice_*.pdf").
 * @property {"all_future_files"|"just_this_file"|"similar_files"} userIntent.scope - Scope of the rule application.
 *
 * @property {Object} learningData - Information used to teach or refine future AI organization.
 * @property {boolean} learningData.createPattern - Whether a reusable pattern should be created from this example.
 * @property {Object} learningData.patternRule - The learned or proposed pattern rule.
 * @property {string} learningData.patternRule.filenamePattern - The filename pattern that this rule applies to.
 * @property {string} learningData.patternRule.pathTemplate - Template path for placing matching files.
 * @property {string} learningData.patternRule.condition - Condition or criteria for applying the rule.
 * @property {number} learningData.patternRule.confidence - Confidence score (0–1) for the learned rule.
 */
