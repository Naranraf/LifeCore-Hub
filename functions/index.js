/**
 * LyfeCore Hub - Cloud Functions Entry Point
 * 
 * Modularized Architecture (Phase 0 - PVE)
 */

const { initializeApp } = require("firebase-admin/app");

// 1. Initialize Firebase Admin once at the root
initializeApp();

// 2. Import and export modules
const ai = require("./src/ai");
const finance = require("./src/finance");
const core = require("./src/core");
const payments = require("./src/payments");

// AI Module
exports.chatWithGemini = ai.chatWithGemini;

// Finance Module
exports.analyzeFinancialRecords = finance.analyzeFinancialRecords;

// Payments Module
exports.createStripeCheckout = payments.createStripeCheckout;
exports.fulfillUpgrade = payments.fulfillUpgrade;

// Core/Auth Module
const authModule = require("./src/auth");
exports.onUserCreated = core.onUserCreated;
exports.verifyRecaptcha = authModule.verifyRecaptcha;
