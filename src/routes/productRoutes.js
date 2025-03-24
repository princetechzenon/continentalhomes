const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.post("/add", verifyAdmin, upload.fields([{ name: "mainImage", maxCount: 1 }, { name: "images", maxCount: 5 }]), productController.addProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.put("/update/:id", verifyAdmin, upload.fields([{ name: "mainImage", maxCount: 1 }, { name: "images", maxCount: 5 }]), productController.updateProduct);
router.delete("/delete/:id", verifyAdmin, productController.deleteProduct);
router.post("/import-csv", verifyAdmin, upload.single("file"), productController.importProductsFromCSV);

module.exports = router;
