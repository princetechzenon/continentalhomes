const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const upload = require("../middleware/upload");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", contactController.getContactUs);
router.put("/update/:id", verifyAdmin, upload.single("bannerImage"), contactController.updateContactUs);

module.exports = router;
