export class PromptBuilder {
	constructor() {}

	build(srcContext, userProfession, folderTree) {
		/* const patterns =
			learningPatterns?.slice(0, 3).map((p) => ({
				pattern: p.filenamePattern,
				path: p.path,
				confidence: p.confidence,
			})) || []; */
		const inputData = { ...srcContext, userProfession, folders: folderTree };

		// Build the prompt
		const prompt = `You are a file organization expert. Analyze the download context and suggest the best folder path.

INPUT DATA:
${JSON.stringify(inputData, null, 2)}

TASK:
1. Analyze the file context (name, page, surrounding content, media details)
2. Consider the user's profession and existing folder structure
3. Use existing folders when possible, create new ones only if necessary
4. Generate relevant tags (3-5) based on content
5. Create a brief description (10-15 words)

RULES:
- Paths must use existing folder structure when appropriate
- Use clear, descriptive folder names (lowercase with underscores)
- Consider learned patterns if confidence > 0.7
- Tags should be lowercase, single words with # prefix
- Filename can be improved if too generic (like IMG_1234.jpg)

OUTPUT FORMAT (JSON only, no markdown):
{
  "folderPath": "Documents/Projects/ClientName/",
  "filename": "improved_filename.jpg",
  "tags": ["#design", "#mockup", "#ui", "#client"],
  "description": "Dashboard mockup for client project",
  "confidence": 0.85,
  "reasoning": "Organized by project and client based on page context"
}

Return ONLY valid JSON, no other text:`;

		return prompt;
	}
}
