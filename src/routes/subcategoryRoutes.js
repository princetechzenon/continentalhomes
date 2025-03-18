const express = require("express");
const router = express.Router();
const subcategoryController = require("../controllers/subcategoryController");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.post("/add", verifyAdmin, subcategoryController.addSubcategory);
router.get("/", subcategoryController.getSubcategories);
router.get("/:id", subcategoryController.getSubcategory);
router.put("/update/:id", verifyAdmin, subcategoryController.updateSubcategory);
router.delete("/delete/:id", verifyAdmin, subcategoryController.deleteSubcategory);

module.exports = router;
