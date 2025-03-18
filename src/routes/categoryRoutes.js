const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.post("/add", verifyAdmin, categoryController.addCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.put("/update/:id", verifyAdmin, categoryController.updateCategory);
router.delete("/delete/:id", verifyAdmin, categoryController.deleteCategory);

module.exports = router;
