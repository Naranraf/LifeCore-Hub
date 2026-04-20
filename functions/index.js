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
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

/**
 * AI Financial Quantitative Analyst Proxy
 * 
 * Uses @google/generative-ai SDK with Gemini 1.5 Pro.
 * Retrieves sensitive financial_records natively on the backend, ensuring data
 * cannot be tampered with by the client, and sends them directly to the AI for analysis.
 */
exports.analyzeFinancialRecords = onCall({
  cors: [/localhost/, "https://lyfecore-hub.web.app", "https://lyfecore-hub.firebaseapp.com"],
}, async (request) => {
  // 1. Mandatory Auth Validation
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Auth is required to run quantitative analysis.");
  }

  const { prompt } = request.data;
  const uid = request.auth.uid;

  try {
    // 2. Secret Engine Init (Fallback to standard process.env mapped by .env or Firebase Secrets)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 3. System Prompt and Model Configuration (Gemini 1.5 Pro)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: "Actúa como un Analista Financiero Cuantitativo experto. Tu objetivo es procesar estructuradamente los datos de deudas e inversiones proporcionados. Genera recomendaciones exactas de optimización de pagos (ej: método avalancha/bola de nieve basado en interest_rate), calcula el progreso actual ($ pagado vs $ total), y otorga proyecciones de ahorro basadas en el posible excedente mensual del usuario tras mitigar la deuda.",
    });

    // 4. Retrieve context securely from Firestore (Zero-Client Tampering)
    const recordsSnap = await db.collection("financial_records")
      .where("user_id", "==", uid)
      .get();
    
    const financialData = recordsSnap.docs.map(doc => doc.data());
    const aiContext = `
      [SISTEMA AUTOMÁTICO] - Registros Financieros Actuales del Usuario:
      ${JSON.stringify(financialData, null, 2)}
      ---
      [MENSAJE DEL USUARIO]:
      ${prompt || "Genera el reporte cuantitativo estándar basado en mis registros."}
    `;

    // 5. Generate and Return Content
    const result = await model.generateContent(aiContext);
    const response = await result.response;
    
    return { text: response.text() };

  } catch (error) {
    logger.error("Financial Analyst AI Error:", error.message);
    throw new HttpsError("internal", `API Error: ${error.message}`);
  }
});
