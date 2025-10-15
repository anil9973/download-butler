/**
 * @typedef {Object} FileMetadata
 * @property {string} filename - The name of the image file (e.g. "pixel-mug.S_HQq03H_Zg19sQ.webp").
 * @property {string} mime - The MIME type of the image (e.g. "image/webp").
 * @property {string} srcUrl - The full URL of the image source.
 * @property {string} referrerUrl - The URL of the page that references the image.
 */

/**
 * @typedef {Object} PageData
 * @property {string} author - The author of the page or article.
 * @property {string} description - The meta description or summary of the page.
 * @property {string} domain - The domain name of the website (e.g. "astro.build").
 * @property {string} title - The title of the page or article.
 * @property {string} url - The canonical URL of the page.
 */

/**
 * @typedef {Object} SurroundingContent
 * @property {string} heading - The nearest or most relevant heading text.
 * @property {string} textContent - The surrounding visible text near the target content.
 */

/**
 * @typedef {Object} TargetMedia
 * @property {string} alt - The alternative text for the media (for accessibility or SEO).
 * @property {string} ariaDescribedBy - The ARIA description ID (if any).
 * @property {string} ariaLabel - The ARIA label for accessibility (if any).
 * @property {string} className - The class name(s) assigned to the media element.
 * @property {string} type - The media type (e.g. "image", "video", "audio").
 */

/**
 * @typedef {Object} PageContext
 * @property {PageData} pageData - Metadata about the page.
 * @property {SurroundingContent} surroundingContent - Contextual text or headings around the target media/content.
 * @property {TargetMedia} targetMedia - Information about the selected or target media element.
 */

export class PromptBuilder {
	constructor() {}

	getPreferenceRules(preference) {
		switch (preference) {
			case "flat":
				return `Flat Structure: Keep minimal subfolders (1-2 levels max)
      - Prefer: Documents/Reports/ over Documents/Work/Projects/Reports/
      - Avoid deep nesting`;

			case "date-based":
				return `Date-Based Structure: Organize by date when relevant
      - Add year/month subfolders: Finance/Invoices/2025/01/
      - Use YYYY/MM/ or YYYY/ patterns
      - Good for: receipts, invoices, photos, logs`;

			case "smart":
			default:
				return `Smart Structure: Balance depth and organization
      - Use 2-4 levels as appropriate
      - Group by: purpose, project, client, or topic
      - Create subfolders when it adds value`;
		}
	}

	getMaxDepth(preference) {
		switch (preference) {
			case "flat":
				return 2;
			case "date-based":
				return 4;
			case "smart":
			default:
				return 4;
		}
	}

	formatExistingStructure() {
		return "";
		/* const grouped = {};
		existingStructure.forEach((file) => {
			const folder = file.folderPath;
			if (!grouped[folder]) grouped[folder] = 0;
			grouped[folder]++;
		});

		return Object.entries(grouped)
			.sort((a, b) => b[1] - a[1]) // Most used first
			.slice(0, 10) // Top 10 folders only
			.map(([path, count]) => `${path} (${count} files)`)
			.join("\n"); */
	}

	/** @param {PageContext} srcContext @param {any[]} folderTree @param {string} userProfession */
	build(fileData, srcContext, folderTree, userProfession, learningPatterns) {
		const preference = "smart";
		const inputData = { ...srcContext, fileToOrganize: fileData, userProfession, folders: folderTree };

		// Build the prompt
		const prompt = `You are a file organization expert. Analyze the download context and suggest the best folder path.

INPUT DATA: ${JSON.stringify(inputData, null, 2)}

FILE TO ORGANIZE : ${JSON.stringify(fileData)}

CONTEXT FROM WEB PAGE : ${JSON.stringify(srcContext)}

AVAILABLE FOLDER STRUCTURE:  ${JSON.stringify(folderTree)}

USER'S LEARNED PATTERNS (${learningPatterns.length} total) : ${
			learningPatterns.length > 0
				? JSON.stringify(fileData)
				: "No patterns learned yet - this is user's first download or new file type."
		}

ORGANIZATION RULES & GUIDELINES:
1. PATH SELECTION STRATEGY:

   a) CHECK LEARNED PATTERNS FIRST:
      - If a pattern matches (confidence > 0.75), strongly prefer it
      - Pattern confidence > 0.85 = almost certainly correct
      - Example: If user always saves invoices in Finance/Invoices/YYYY/, use that
   
   b) ANALYZE FILE CONTEXT:
      - Use page title, surrounding text, and media descriptions
      - Look for project names, client names, dates, topics
      - Consider file source domain (github.com → Code/, figma.com → Design/)
   
   c) RESPECT EXISTING STRUCTURE:
      - Use existing folders when semantically appropriate
      - Don't create new folders if similar ones exist
      - Example: If "Projects/ClientA/" exists, use it for ClientA files
   
   d) FOLLOW USER'S ORGANIZATION PREFERENCE: ${this.getPreferenceRules(preference)}

2. FOLDER PATH RULES:

  FILE SYSTEM ACCESS MODE:
  - You have access to MULTIPLE root folders (Documents/, Pictures/, etc.)
  - Each root has RELATIVE paths (e.g., Finance/ not Documents/Finance/)
  - CRITICAL: Only suggest paths WITHIN the granted root folders
  - Cannot suggest parent folders (they're read-only context)
  - Example: If root is "Finance/", suggest "Finance/Invoices/" NOT "Documents/Finance/"
  
  PATH FORMAT: RootName/Subfolder/Subfolder/
  - Start with exact root name from AVAILABLE FOLDER STRUCTURE
  - Add subfolders as needed (max ${this.getMaxDepth(preference)} levels)
  - Always end with trailing slash /

3. FILENAME IMPROVEMENT RULES:

  ALWAYS improve generic filenames:
  - ❌ "Screenshot 2025-01-15 at 10.30.45 AM.png"
  - ✅ "tesla_model3_dashboard_interior.png"
  
  - ❌ "document (3).pdf"
  - ✅ "q1_financial_report_2025.pdf"
  
  - ❌ "Untitled-1.fig"
  - ✅ "dashboard_mockup_v3.fig"
  
  - ❌ "IMG_2847.jpg"
  - ✅ "venice_sunset_canal_view.jpg"
  
  KEEP meaningful filenames:
  - ✅ "react_hooks_tutorial.pdf" (already good)
  - ✅ "invoice_march_2025_clientA.pdf" (has context)
  
  Filename best practices:
  - Use descriptive, searchable names
  - Lowercase with underscores or hyphens
  - Include key identifiers (dates, versions, names)
  - Keep under 60 characters
  - Preserve file extension

4. TAGGING STRATEGY:

   Generate 2-4 relevant tags:
   - Content type: #invoice, #tutorial, #mockup, #screenshot
   - Topic/Subject: #react, #tesla, #finance, #design
   - Purpose: #work, #personal, #reference, #archive
   - Source: #github, #figma, #email, #blog
   - Project: #clientA, #website_redesign, #app_v2
   
   Tags must be:
   - Lowercase
   - Single words (use underscore for compounds: #web_dev)
   - Prefixed with #
   - Searchable and meaningful

5. CONFIDENCE SCORING:

   Return confidence score (0.0 to 1.0):
   
   0.95-1.0  = Exact learned pattern match
   0.85-0.94 = Strong contextual signals + existing folder
   0.75-0.84 = Good context, logical path
   0.60-0.74 = Reasonable guess, some ambiguity
   0.40-0.59 = Low context, generic suggestion
   0.0-0.39  = Very uncertain, fallback path
   
   Low confidence (<0.75) will trigger user confirmation popup.

6. SPECIAL CASES:

   DATES IN FILENAME:
   - If filename has date (2025-01-15, 2025_Q1, etc.)
   - Consider date-based subfolder: Finance/Invoices/2025/
   
   PROJECT NAMES:
   - Extract from page title or heading
   - Create project folder: Work/Projects/ProjectName/
   
   CLIENT NAMES:
   - Look for "client", "customer", company names
   - Organize by client: Work/Clients/ClientName/
   
   SERIES/VERSIONS:
   - Files like "mockup_v1", "mockup_v2", "mockup_v3"
   - Keep together in same folder
   
   DOMAIN-SPECIFIC:
   - github.com → Code/GitHub/
   - figma.com → Design/Figma/
   - email domains → consider Work/ or Personal/
   - Drive/Dropbox → Shared/CollabFolder/

OUTPUT FORMAT (JSON ONLY)
You MUST respond with valid JSON in this exact format:

{
  "folderPath": "Documents/Projects/ClientName/",
  "filename": "improved_filename.jpg",
  "tags": ["#design", "#mockup", "#ui", "#client"],
  "description": "Dashboard mockup for client project",
  "confidence": 0.85,
  "reasoning": "Organized by project and client based on page context"
}
  
CRITICAL RULES FOR JSON OUTPUT:
- Return ONLY valid JSON, no markdown, no code blocks, no explanations
- folderPath must match EXACT root folder name from available structure
- filename must include file extension
- confidence must be number between 0.0 and 1.0
- If uncertain, return lower confidence score`;

		return prompt;
	}

	/** @param {PageContext} srcContext @param {any[]} folderTree @param {string} userProfession @param {import("./ai.js").FileOrganizationSuggestion} originalSuggestion  */
	buildUserInstructionPrompt(
		fileData,
		srcContext,
		folderTree,
		userProfession,
		originalSuggestion,
		userSelectedPath,
		userInstruction
	) {
		const learningPatterns = [];
		return `You are helping organize a file based on user feedback.

ORIGINAL FILE: ${JSON.stringify(fileData)}

SOURCE CONTEXT:  ${JSON.stringify(srcContext)}

AVAILABLE FOLDER STRUCTURE:  ${JSON.stringify(folderTree)}

YOUR PREVIOUS SUGGESTION: ${originalSuggestion}

${userSelectedPath ? `USER'S PATH SELECTION: The user manually changed the path to: "${userSelectedPath}"` : ""}

${
	userInstruction
		? `USER'S INSTRUCTION: "${userInstruction}"

Examples of what user might say:
- "Save this type of file in Work/Projects/"
- "All invoices should go to Finance/Invoices/YYYY/"
- "Keep design files together in Design/ClientName/"
- "This is for the Tesla project"
- "Group by client name, not by date"
- "Don't create so many subfolders"
`
		: ""
}

CONTEXT FOR UNDERSTANDING USER INTENT: ${this.formatExistingStructure()}

USER PROFILE:
- Profession: ${userProfession}
- Previous corrections: ${learningPatterns.length} patterns learned

${
	/* prettier-ignore */ learningPatterns.length > 0 ? ` LEARNED PATTERNS (User's preferences): ${learningPatterns .slice(0, 5) .map( (p, i) => ` ${i + 1}. Files matching "${p.filenamePattern}" → ${p.path} (Used ${ p.correctionCount } times, confidence: ${(p.confidence * 100).toFixed(0)}%) ` ) .join("")} ` : ""
}

TASK:
Analyze the user's instruction and determine:
1. What the user REALLY wants (interpret natural language)
2. Whether this is a one-time fix or a general rule
3. The correct path based on their preference
4. A pattern to learn for future similar files

INTERPRETATION GUIDELINES:

1. LOCATION INSTRUCTIONS:
   - "in Work" → Downloads/Work/
   - "Finance folder" → Downloads/Finance/ or Work/Finance/
   - "with other invoices" → Find existing invoice location
   - "Client folder" → Downloads/Work/Projects/[ClientName]/
   - "keep together" → Same folder as similar files
   - "separate by year" → Add /YYYY/ subfolder

2. ORGANIZATION RULES:
   - "all X should go to Y" → Create general rule for file type
   - "like this one" → Copy pattern from previous file
   - "don't create subfolders" → Use flatter structure
   - "organize by date" → Add date-based subfolders
   - "group by project" → Look for project names in context

3. FILENAME INSTRUCTIONS:
   - "rename better" → Improve filename clarity
   - "keep original name" → Don't change filename
   - "add date" → Include date in filename
   - "simpler name" → Shorter, clearer name

4. CONFIDENCE SIGNALS:
   - If user says "always", "all", "never" → confidence: 0.95
   - If user says "maybe", "probably" → confidence: 0.70
   - If user says "just this one" → confidence: 0.50 (don't create rule)

OUTPUT FORMAT (JSON):
{
  "folderPath": "Downloads/Correct/Path/",
  "filename": "improved_filename.ext",
  "tags": ["#tag1", "#tag2"],
  "description": "Brief description",
  "confidence": 0.90,
  "reasoning": "Applied user's instruction: [explain what you understood]",
  
  "userIntent": {
    "wantsRule": true,
    "ruleDescription": "Save all invoices in Finance/Invoices/YYYY/",
    "appliesTo": "invoice_*.pdf",
    "scope": "all_future_files" // or "just_this_file" or "similar_files"
  },
  
  "learningData": {
    "createPattern": true,
    "patternRule": {
      "filenamePattern": "invoice_*.pdf",
      "pathTemplate": "Downloads/Finance/Invoices/YYYY/",
      "condition": "files with 'invoice' in name from email domains",
      "confidence": 0.95
    }
  }
}
  
EXAMPLES:

Example 1 - Specific location:
User instruction: "Save this in my Work/Projects/Tesla folder"
File: dashboard_screenshot.png
Output:
{
  "folderPath": "Downloads/Work/Projects/Tesla/",
  "filename": "dashboard_screenshot.png",
  "tags": ["#work", "#tesla", "#project", "#screenshot"],
  "description": "Screenshot for Tesla project",
  "confidence": 0.95,
  "reasoning": "User explicitly specified Work/Projects/Tesla location",
  "userIntent": {
    "wantsRule": false,
    "scope": "just_this_file"
  },
  "learningData": {
    "createPattern": false
  }
}

Example 2 - General rule:
User instruction: "All invoices should go in Finance/Invoices organized by year"
File: invoice_march_2025.pdf
Output:
{
  "folderPath": "Downloads/Finance/Invoices/2025/",
  "filename": "invoice_march_2025.pdf",
  "tags": ["#invoice", "#finance", "#2025", "#march"],
  "description": "March 2025 invoice",
  "confidence": 0.98,
  "reasoning": "Applied user's rule: invoices organized by year in Finance folder",
  "userIntent": {
    "wantsRule": true,
    "ruleDescription": "Organize all invoices by year in Finance/Invoices/YYYY/",
    "appliesTo": "invoice_*.pdf",
    "scope": "all_future_files"
  },
  "learningData": {
    "createPattern": true,
    "patternRule": {
      "filenamePattern": "invoice_*",
      "pathTemplate": "Downloads/Finance/Invoices/YYYY/",
      "condition": "filename contains 'invoice' OR from known invoice domains",
      "confidence": 0.95
    }
  }
}

Example 3 - Pattern from similar files:
User instruction: "Keep design files together like the other mockups"
File: untitled_design.fig
Context: Existing files in Downloads/Design/Mockups/
Output:
{
  "folderPath": "Downloads/Design/Mockups/",
  "filename": "dashboard_design_v1.fig",
  "tags": ["#design", "#mockup", "#figma"],
  "description": "Dashboard design mockup",
  "confidence": 0.88,
  "reasoning": "Grouped with other mockups as user requested, improved filename",
  "userIntent": {
    "wantsRule": true,
    "ruleDescription": "Keep design files grouped by type in Design folder",
    "appliesTo": "*.fig, *.sketch, *.psd",
    "scope": "similar_files"
  },
  "learningData": {
    "createPattern": true,
    "patternRule": {
      "filenamePattern": "*.fig",
      "pathTemplate": "Downloads/Design/Mockups/",
      "condition": "Figma files or design mockups",
      "confidence": 0.85
    }
  }
}

Example 4 - Simpler structure:
User instruction: "Too many subfolders, just put it in Documents"
File: report.pdf
Original suggestion: Downloads/Work/Projects/ClientA/Reports/2025/Q1/
Output:
{
  "folderPath": "Downloads/Documents/",
  "filename": "report.pdf",
  "tags": ["#document", "#report"],
  "description": "Report document",
  "confidence": 0.80,
  "reasoning": "User prefers simpler structure, reduced subfolder depth",
  "userIntent": {
    "wantsRule": false,
    "ruleDescription": "User prefers flatter folder structure",
    "scope": "just_this_file"
  },
  "learningData": {
    "createPattern": false,
    "note": "User prefers simpler organization, avoid deep nesting"
  }
}

Example 5 - Domain-based rule:
User instruction: "Save everything from GitHub in a Code folder"
File: react-components-master.zip
Source: github.com
Output:
{
  "folderPath": "Downloads/Code/GitHub/",
  "filename": "react_components_master.zip",
  "tags": ["#code", "#github", "#react", "#components"],
  "description": "React components repository from GitHub",
  "confidence": 0.92,
  "reasoning": "Applied domain-based rule: GitHub downloads go to Code folder",
  "userIntent": {
    "wantsRule": true,
    "ruleDescription": "All downloads from GitHub go to Code/GitHub/",
    "appliesTo": "*.*",
    "scope": "all_future_files"
  },
  "learningData": {
    "createPattern": true,
    "patternRule": {
      "filenamePattern": "*",
      "pathTemplate": "Downloads/Code/GitHub/",
      "condition": "domain === 'github.com'",
      "confidence": 0.95
    }
  }
}

NOW ANALYZE THE USER'S INSTRUCTION AND RESPOND WITH JSON:`;
	}

	/** @param {FileMetadata} fileData @param {PageContext} SourceContext @param {string} userProfession */
	buildForDownloadsFolder(fileData, SourceContext, userProfession) {
		return `You are an expert file system organizer integrated into a browser. Your single task is to determine the single best subfolder path (up to two levels deep) and a new filename for a newly downloaded file.

CRITICAL CONSTRAINTS:

- The final path MUST be relative to the user's main 'Downloads' folder. Do not suggest absolute paths like C:/Users/ or /home/.
- The folder depth MUST NOT exceed two levels (e.g., Category/Sub-Category/). A single level is acceptable if no logical sub-category exists.
- Your response MUST be the file path string and NOTHING else. Do not include any explanation, markdown, or conversational text.
		
CONTEXT:
User: ${userProfession}
Mode: Downloads folder organization (no external folder access)
Goal: Create clean subfolder structure and improve filename clarity

FILE TO ORGANIZE: ${JSON.stringify(fileData)}

SOURCE CONTEXT:  ${JSON.stringify(SourceContext)}

YOUR STEP-BY-STEP LOGIC:
1.  Analyze and Categorize ( This will be your first-level folder) :
   Based on context clues, categorize as:
   - Work/Professional (projects, documents, reports)
   - Personal (photos, receipts, misc)
   - Media (images, videos, audio)
   - Development (code, repos, tools)
   - Learning (tutorials, courses, ebooks)
   - Archives (old files, backups)
   - Temporary (files to review/delete later) etc ? 

2.  Determine Sub-Category (if applicable): Based on the context, identify a logical second-level folder.
    - For "Documents" or "Receipts", this could be the sender or company name (e.g., "Documents/Acme_Corp/").
    - For "Images", this could be the event or source (e.g., "Images/Hawaii_Vacation/").
    - For "Projects", this could be the client or project name.
    - If no clear sub-category exists, use only the first-level folder.
3.  Synthesize New Filename: Create a clean, descriptive filename using the following rules:
    - Fix generic names (screenshot, image, download, file123, etc.)
    - Remove redundant info (e.g., "Copy of", "final_final", version numbers)
    - For documents, invoices, and receipts, begin the filename with the date in "YYYY-MM-DD" format.
    - Extract the primary subject or sender from the source URL or filename.
    - Use lowercase with underscores or hyphens
    - Keep the original file extension.
    - Keep it concise (max 60 characters)

EXAMPLES:

* Input: Filename: "photo-159.jpg", URL: "https://unsplash.com/photos/xyz", MIME: "image/jpeg"
* Output: "Images/Unsplash/Photo_159.jpg"

* Input: Filename: "inv_834.pdf", URL: "https://verizon.com/api/bill", MIME: "application/pdf", Date: "2025-10-15"
* Output: "Documents/Receipts/2025-10-15_Verizon_Bill.pdf"

* Input: Filename: "react-v18.2.0.zip", URL: "https://github.com/facebook/react/...", MIME: "application/zip"
* Output: "Code/React_v18.2.0.zip"

* Input: Filename: "Q4_brief_final.docx", URL: "https://acme-corp.sharepoint.com/project-phoenix/...", MIME: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
* Output: "Projects/Acme_Corp/Q4_Project_Phoenix_Brief.docx"

Now, process the provided context and output only the final file path. Don't provide example or explaination`;
	}
}
