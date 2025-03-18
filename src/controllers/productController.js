const Product = require("../models/productModel");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");


// ✅ CSV File Upload Setup
const upload = multer({ dest: "uploads/" });

// ✅ Import Products from CSV
exports.importProductsFromCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "CSV file is required!" });
        }

        const products = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => {
                if (row.name && row.sku && row.price) {
                    products.push(row);
                }
            })
            .on("end", async () => {
                try {
                    await Product.importProducts(products);
                    fs.unlinkSync(req.file.path); // Delete file after processing
                    res.json({ message: "Products imported successfully!", count: products.length });
                } catch (error) {
                    res.status(500).json({ message: "Error importing products", error });
                }
            });
    } catch (error) {
        res.status(500).json({ message: "Error processing CSV file", error });
    }
};

// Multer middleware export for file upload
exports.uploadCSV = upload.single("file");


// ✅ Add Product
exports.addProduct = async (req, res) => {
    try {
        const productData = req.body;
        if (!productData.name || !productData.sku || !productData.price) {
            return res.status(400).json({ message: "Product Name, SKU, and Price are required!" });
        }

        const product = await Product.createProduct(productData);
        res.status(201).json({ message: "Product added!", product });
    } catch (error) {
        res.status(500).json({ message: "Error adding product", error });
    }
};

// ✅ Get All Products
exports.getProducts = async (req, res) => {
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const products = await Product.getFilteredProducts(search, limit, offset);
        res.json({ products, currentPage: page });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
};

// ✅ Get Single Product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.getProductById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found!" });

        res.json({ product });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
};

// ✅ Update Product
exports.updateProduct = async (req, res) => {
    try {
        const productData = req.body;
        const product = await Product.updateProduct(req.params.id, productData);
        res.json({ message: "Product updated!", product });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        await Product.deleteProduct(req.params.id);
        res.json({ message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};
