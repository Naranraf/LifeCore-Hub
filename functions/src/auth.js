const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { RecaptchaEnterpriseServiceClient } = require("@google-cloud/recaptcha-enterprise");

/**
 * Verify reCAPTCHA Enterprise Token
 */
exports.verifyRecaptcha = onCall(async (request) => {
  const { token, action } = request.data;
  
  if (!token || !action) {
    throw new HttpsError("invalid-argument", "Missing token or action.");
  }

  const projectID = process.env.GCLOUD_PROJECT || "lyfecore-hub";
  const recaptchaKey = "6LcON8csAAAAAMCvqmNde2sybCkV76uZFnms_Nmb";

  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  try {
    const [response] = await client.createAssessment({
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
          expectedAction: action,
        },
      },
      parent: projectPath,
    });

    if (!response.tokenProperties.valid) {
      logger.error(`reCAPTCHA invalid: ${response.tokenProperties.invalidReason}`);
      return { success: false, score: 0, reason: response.tokenProperties.invalidReason };
    }

    if (response.tokenProperties.action !== action) {
      logger.error(`reCAPTCHA action mismatch: ${response.tokenProperties.action} vs ${action}`);
      return { success: false, score: 0, reason: "action-mismatch" };
    }

    logger.log(`reCAPTCHA score: ${response.riskAnalysis.score}`);
    return {
      success: true,
      score: response.riskAnalysis.score,
      reasons: response.riskAnalysis.reasons,
    };
  } catch (err) {
    logger.error("reCAPTCHA assessment failed:", err.message);
    throw new HttpsError("internal", "Verification failed.");
  }
});
