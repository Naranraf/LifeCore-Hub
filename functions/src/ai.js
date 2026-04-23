const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { VertexAI } = require("@google-cloud/vertexai");

const db = getFirestore();
const vertexAI = new VertexAI({
  project: "lyfecore-hub",
  location: "us-central1",
});

exports.chatWithGemini = onCall({
  cors: [/localhost/, "https://lyfecore-hub.web.app", "https://lyfecore-hub.firebaseapp.com"],
}, async (request) => {
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
    await db.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      const currentUsage = userSnap.exists ? (userSnap.data().geminiUsageCount || 0) : 0;
      
      if (currentUsage >= MAX_FREE_MESSAGES) {
        throw new HttpsError("resource-exhausted", "Free plan usage limit reached.");
      }
      t.set(userRef, { geminiUsageCount: FieldValue.increment(1) }, { merge: true });
    });

    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });

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

    return { text };
  } catch (error) {
    logger.error("Vertex AI Error:", error.message);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", `Error al procesar: ${error.message}`);
  }
});
