const express = require("express");
const supportRateLimiter = require("../middleware/supportRateLimiter");

const {
  submitBugReport,
  submitFeatureRequest,
  submitContactSupport,
} = require("../controllers/supportController");

const router = express.Router();

router.use(supportRateLimiter);

router.post("/bug", submitBugReport);
router.post("/feature", submitFeatureRequest);
router.post("/contact", submitContactSupport);

module.exports = router;
