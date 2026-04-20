/**
 * LyfeCore Hub - Cloud BFF (Backend-for-Frontend)
 *
 * Uses Vertex AI (Google Cloud's AI platform) which authenticates
 * automatically via the project's service account — no API key required.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { VertexAI } = require("@google-cloud/vertexai");

initializeApp();

// Initialize Vertex AI with the project and region
const vertexAI = new VertexAI({
  project: "lyfecore-hub",
  location: "us-central1",
});

/**
 * Gemini AI Proxy via Vertex AI
 *
 * Securely calls Gemini 1.5 Flash using GCP project credentials.
 * Only authenticated Firebase users can call this function.
 */
exports.chatWithGemini = onCall({
  cors: [/localhost/, "https://lyfecore-hub.web.app", "https://lyfecore-hub.firebaseapp.com"],
}, async (request) => {
  // 1. Mandatory Auth Check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes estar autenticado para hablar con Gemini.");
  }

  const { prompt, history } = request.data;

  if (!prompt) {
    throw new HttpsError("invalid-argument", "El prompt es obligatorio.");
  }

  try {
    // 2. Get Gemini 1.5 Flash model via Vertex AI
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });

    // 3. Build contents array (supports multi-turn conversation)
    const contents = [];
    if (history && Array.isArray(history) && history.length > 0) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === "ai" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // 4. Generate response
    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    return { text };
  } catch (error) {
    logger.error("Vertex AI Error:", error.message);
    throw new HttpsError("internal", `Error al procesar: ${error.message}`);
  }
});

/**
 * Future Function: syncGoogleData
 * Will use the user's stored OAuth token to sync with Calendar/Tasks.
 */
