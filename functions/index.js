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

// AI Module
exports.chatWithGemini = ai.chatWithGemini;

// Finance Module
exports.analyzeFinancialRecords = finance.analyzeFinancialRecords;

// Core/Auth Module
exports.onUserCreated = core.onUserCreated;
