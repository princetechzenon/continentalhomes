const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.post("/add", verifyAdmin, productController.addProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.put("/update/:id", verifyAdmin, productController.updateProduct);
router.delete("/delete/:id", verifyAdmin, productController.deleteProduct);
// ✅ CSV Import Route
router.post("/import-csv", verifyAdmin, productController.uploadCSV, productController.importProductsFromCSV);


module.exports = router;
