const { logger } = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

/**
 * Core Auth/Triggers
 * (Placeholder for future auth-related background tasks)
 */
exports.onUserCreated = async (user) => {
  logger.log(`New user created: ${user.uid}`);
  // Initialize default user data in Firestore
  return db.collection("users").doc(user.uid).set({
    geminiUsageCount: 0,
    createdAt: new Date().toISOString(),
  }, { merge: true });
};
