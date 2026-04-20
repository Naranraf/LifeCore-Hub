/**
 * LyfeCore Hub - Cloud BFF (Backend-for-Frontend)
 *
 * Uses Vertex AI (Google Cloud's AI platform) which authenticates
 * automatically via the project's service account — no API key required.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { VertexAI } = require("@google-cloud/vertexai");

initializeApp();
const db = getFirestore();

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

  const uid = request.auth.uid;
  const userRef = db.collection('users').doc(uid);
  const MAX_FREE_MESSAGES = 15;

  try {
    // 2. Check Paywall / Usage limit
    const userSnap = await userRef.get();
    let currentUsage = 0;
    
    if (userSnap.exists) {
      const userData = userSnap.data();
      currentUsage = userData.geminiUsageCount || 0;
    }

    if (currentUsage >= MAX_FREE_MESSAGES) {
      throw new HttpsError("resource-exhausted", "Free plan usage limit reached.");
    }

    // 3. Get Gemini 1.5 Flash model via Vertex AI
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

    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    // 5. Increment Usage counter in Firestore tracking
    await userRef.set({
      geminiUsageCount: FieldValue.increment(1)
    }, { merge: true });

    return { text };
  } catch (error) {
    logger.error("Vertex AI Error:", error.message);
    // Rethrow standard HttpsError to client
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", `Error al procesar: ${error.message}`);
  }
});

/**
 * Future Function: syncGoogleData
 * Will use the user's stored OAuth token to sync with Calendar/Tasks.
 */
