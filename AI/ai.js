/* import { initializeApp, getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "./firebase-ai.js";

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

// Create a `GenerativeModel` instance with a model that supports your use case.
const model = getGenerativeModel(googleAI, { mode: InferenceMode.PREFER_ON_DEVICE }); */

export async function generateFileMetadata(promptText) {
	// To generate text output, call generateContent with the text input
	/* const result = await model.generateContent(promptText);

	const response = result.response;
	const text = response.text();
	console.log(text); */

	return {
		folderPath: "Documents/Projects/ClientName/",
		filename: "improved_filename.jpg",
		tags: ["#design", "#mockup", "#ui", "#client"],
		description: "Dashboard mockup for client project",
		confidence: 0.85,
		reasoning: "Organized by project and client based on page context",
	};
}
