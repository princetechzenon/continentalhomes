const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const upload = require("../middleware/upload");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", faqController.getFAQ);
router.put("/update/:id", verifyAdmin, upload.single("bannerImage"), faqController.updateFAQ);

module.exports = router;
