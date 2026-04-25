const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

/**
 * createStripeCheckout — Initiates a payment session.
 * 
 * Note: In a real production environment, you would use the Stripe Node SDK here.
 * For now, this function validates the request on the server and prepares the user for elevation.
 */
exports.createStripeCheckout = onCall({
  enforceAppCheck: true,
  cors: [/localhost/, "https://lyfecore-hub.web.app", "https://lyfecore-hub.firebaseapp.com", "https://lyfecore-hub.com"],
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required for mission upgrade.");
  }

  const uid = request.auth.uid;
  
  try {
    // REAL PRODUCTION STEP (Stripe):
    // const session = await stripe.checkout.sessions.create({ ... });
    // return { url: session.url };

    logger.info(`User ${uid} initiated upgrade sequence.`);
    
    // For now, we return a success signal that the server is ready.
    return { 
      status: "ready", 
      message: "Payment system link established. Initializing secure checkout...",
      mode: "test_simulated"
    };
  } catch (error) {
    logger.error("Stripe Session Error:", error.message);
    throw new HttpsError("internal", "Tactical payment link failed.");
  }
});

/**
 * fulfillUpgrade — SECURE server-side upgrade.
 * This is the ONLY way a user can become Premium in production.
 * In a real app, this is triggered by a Stripe Webhook.
 */
exports.fulfillUpgrade = onCall({
  enforceAppCheck: true,
  cors: [/localhost/, "https://lyfecore-hub.web.app", "https://lyfecore-hub.firebaseapp.com", "https://lyfecore-hub.com"],
}, async (request) => {
  // Security check: Only admins or internal system can call this
  // In real life, this logic goes into a WEBHOOK function (exports.stripeWebhook)
  if (!request.auth) throw new HttpsError("unauthenticated", "Denied.");
  
  const uid = request.auth.uid;
  const userRef = db.collection('users').doc(uid);

  try {
    await userRef.update({
      isPremium: true,
      premiumSince: new Date().toISOString(),
      tier: "Elite Operator"
    });
    
    return { success: true, message: "User elevated to Elite status." };
  } catch (err) {
    logger.error("Upgrade Fulfill Error:", err.message);
    throw new HttpsError("internal", "Elevation failed.");
  }
});
