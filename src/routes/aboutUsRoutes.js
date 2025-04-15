const express = require("express");
const router = express.Router();
const aboutUsController = require("../controllers/aboutUsController");
const upload = require("../middleware/upload");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", aboutUsController.getAboutUs);
router.put("/update/:id", verifyAdmin, upload.single("bannerImage"), aboutUsController.updateAboutUs);

module.exports = router;
