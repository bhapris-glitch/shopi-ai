// ======================================
// shopi-ai/src/routes/subscription.routes.js
// Layboka AI
// Subscription Routes
// Production Ready
// Part 1
// ======================================

"use strict";

// ======================================
// IMPORTS
// ======================================

const express =
require("express");

const router =
express.Router();

// ======================================
// CONTROLLER
// ======================================

const subscriptionController =
require("../controllers/subscription.controller");

// ======================================
// MIDDLEWARE
// ======================================

const authMiddleware =
require("../../middleware/authMiddleware");

const adminMiddleware =
require("../../middleware/adminMiddleware");

// ======================================
// PUBLIC ROUTES
// ======================================

// --------------------------------------
// Health
// GET /api/subscription/health
// --------------------------------------

router.get(

    "/health",

    subscriptionController.health

);

// --------------------------------------
// System Status
// GET /api/subscription/status
// --------------------------------------

router.get(

    "/status",

    subscriptionController.systemStatus

);

// ======================================
// AUTHENTICATED ROUTES
// ======================================

// --------------------------------------
// My Subscription
// GET /api/subscription/me
// --------------------------------------

router.get(

    "/me",

    authMiddleware,

    subscriptionController.mySubscription

);

// --------------------------------------
// Billing Summary
// GET /api/subscription/billing
// --------------------------------------

router.get(

    "/billing",

    authMiddleware,

    subscriptionController.getBillingSummary

);

// --------------------------------------
// Analytics
// GET /api/subscription/analytics
// --------------------------------------

router.get(

    "/analytics",

    authMiddleware,

    subscriptionController.getAnalytics

);

// --------------------------------------
// Upgrade Discount
// GET /api/subscription/upgrade-discount
// --------------------------------------

router.get(

    "/upgrade-discount",

    authMiddleware,

    subscriptionController.getUpgradeDiscount

);

// ======================================
// NEXT
// ======================================
//
// Part 2
//
// • POST /trial
// • POST /create
// • POST /activate
// • POST /renew
// • POST /upgrade
// • POST /cancel
// • POST /pause
// ======================================
// PART 2
// Subscription POST Routes
// ======================================

// --------------------------------------
// Create Trial
// POST /api/subscription/trial
// --------------------------------------

router.post(

    "/trial",

    authMiddleware,

    subscriptionController.createTrial

);

// --------------------------------------
// Create Subscription
// POST /api/subscription/create
// --------------------------------------

router.post(

    "/create",

    authMiddleware,

    subscriptionController.createSubscription

);

// --------------------------------------
// Activate Subscription
// POST /api/subscription/activate
// --------------------------------------

router.post(

    "/activate",

    authMiddleware,

    subscriptionController.activateSubscription

);

// --------------------------------------
// Renew Subscription
// POST /api/subscription/renew
// --------------------------------------

router.post(

    "/renew",

    authMiddleware,

    subscriptionController.renewSubscription

);

// --------------------------------------
// Upgrade Subscription
// POST /api/subscription/upgrade
// --------------------------------------

router.post(

    "/upgrade",

    authMiddleware,

    subscriptionController.upgradeSubscription

);

// --------------------------------------
// Cancel Subscription
// POST /api/subscription/cancel
// --------------------------------------

router.post(

    "/cancel",

    authMiddleware,

    subscriptionController.cancelSubscription

);

// --------------------------------------
// Pause Subscription
// POST /api/subscription/pause
// --------------------------------------

router.post(

    "/pause",

    authMiddleware,

    subscriptionController.pauseSubscription

);

// ======================================
// NEXT
// ======================================
//
// Part 3
//
// • POST /lock
// • POST /unlock
// • POST /payment-failed
// • POST /expire-trial
// • POST /enterprise
// ======================================
// PART 3
// Chatbot Routes
// Enterprise Route
// ======================================

// --------------------------------------
// Lock Chatbot
// POST /api/subscription/lock
// --------------------------------------

router.post(

    "/lock",

    authMiddleware,

    subscriptionController.lockChatbot

);

// --------------------------------------
// Unlock Chatbot
// POST /api/subscription/unlock
// --------------------------------------

router.post(

    "/unlock",

    authMiddleware,

    subscriptionController.unlockChatbot

);

// --------------------------------------
// Payment Failed
// POST /api/subscription/payment-failed
// --------------------------------------

router.post(

    "/payment-failed",

    authMiddleware,

    subscriptionController.paymentFailed

);

// --------------------------------------
// Expire Trial
// POST /api/subscription/expire-trial
// --------------------------------------

router.post(

    "/expire-trial",

    authMiddleware,

    subscriptionController.expireTrial

);

// --------------------------------------
// Chatbot Banner
// GET /api/subscription/banner
// --------------------------------------

router.get(

    "/banner",

    authMiddleware,

    subscriptionController.getBanner

);

// --------------------------------------
// Recharge Information
// GET /api/subscription/recharge
// --------------------------------------

router.get(

    "/recharge",

    authMiddleware,

    subscriptionController.getRechargeData

);

// --------------------------------------
// Enterprise Request
// POST /api/subscription/enterprise
// --------------------------------------

router.post(

    "/enterprise",

    authMiddleware,

    subscriptionController.createEnterpriseRequest

);

// ======================================
// NEXT
// ======================================
//
// Part 4
//
// • Admin Dashboard Route
// • module.exports
// • Production Finish
// ======================================
// PART 4
// Admin Routes
// Export
// Production Finish
// ======================================

// ======================================
// ADMIN ROUTES
// ======================================

// --------------------------------------
// Admin Dashboard
// GET /api/subscription/admin/dashboard
// --------------------------------------

router.get(

    "/admin/dashboard",

    authMiddleware,

    adminMiddleware,

    subscriptionController.adminDashboard

);

// --------------------------------------
// Admin System Status
// GET /api/subscription/admin/status
// --------------------------------------

router.get(

    "/admin/status",

    authMiddleware,

    adminMiddleware,

    subscriptionController.systemStatus

);

// --------------------------------------
// Admin Health
// GET /api/subscription/admin/health
// --------------------------------------

router.get(

    "/admin/health",

    authMiddleware,

    adminMiddleware,

    subscriptionController.health

);

// ======================================
// EXPORT
// ======================================

module.exports = router;

