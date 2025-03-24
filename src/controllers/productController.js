const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const Product = require("../models/productModel");




// ✅ Import Products from CSV
exports.importProductsFromCSV = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "CSV file is required!" });

    const products = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            if (row.name && row.sku && row.price) {
                products.push(row);
            }
        })
        .on("end", async () => {
            await Product.importProducts(products);
            fs.unlinkSync(req.file.path);
            res.json({ message: "Products imported successfully!", count: products.length });
        });
};


// ✅ Add Product
exports.addProduct = async (req, res) => {
    try {
        const { name, sku, price, weight, width, height, depth, categoryId, subcategoryId, description } = req.body;

        if (!name || !sku || !price) {
            return res.status(400).json({ message: "Product Name, SKU, and Price are required!" });
        }

        const mainImage = req.files["mainImage"] ? req.files["mainImage"][0].path : null;
        const images = req.files["images"] ? req.files["images"].map(file => file.path) : [];

        const product = await Product.createProduct({ 
            name, sku, price, weight, width, height, depth, categoryId, subcategoryId, description, mainImage, images 
        });

        res.status(201).json({ message: "Product added!", product });
    } catch (error) {
        res.status(500).json({ message: "Error adding product", error });
    }
};

// ✅ Get Products with Pagination & Search
exports.getProducts = async (req, res) => {
    try {
        let { page, limit, search, categoryId, subcategoryId } = req.query;
        
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const products = await Product.getFilteredProducts(search, categoryId, subcategoryId, limit, offset);
        const totalProducts = await Product.getProductCount(search, categoryId, subcategoryId);
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            products,
            currentPage: page,
            totalPages,
            totalProducts
        });
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
        const { name, sku, price, weight, width, height, depth, categoryId, subcategoryId, description } = req.body;

        if (!name || !sku || !price) return res.status(400).json({ message: "Product Name, SKU, and Price are required!" });

        // ✅ Fetch existing product
        const existingProduct = await Product.getProductById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found!" });
        }

        console.log("🛠 Existing Product Data:", existingProduct);

        // ✅ Function to safely delete files
        const deleteFile = (filePath) => {
            if (filePath) {
                const normalizedPath = path.join(__dirname, "..", "..", filePath.replace(/\\/g, "/"));

                console.log("🔍 Attempting to delete:", normalizedPath);
                
                if (fs.existsSync(normalizedPath)) {
                    fs.unlinkSync(normalizedPath);
                    console.log("✅ Deleted successfully:", normalizedPath);
                } else {
                    console.warn("⚠ File not found:", normalizedPath);
                }
            }
        };

        // ✅ Check if new files are uploaded
        let newMainImage = req.files["mainImage"] ? req.files["mainImage"][0].path : null;
        let newImages = req.files["images"] ? req.files["images"].map(file => file.path) : [];

        // ✅ Delete old mainImage if a new one is uploaded
        if (newMainImage && existingProduct.mainImage) {
            deleteFile(existingProduct.mainImage);
        } else {
            newMainImage = existingProduct.mainImage; // Keep old image if no new image is uploaded
        }

        // ✅ Handle additional images
        let updatedImages = existingProduct.images;
        if (typeof updatedImages === "string") {
            try {
                updatedImages = JSON.parse(updatedImages);
            } catch (e) {
                updatedImages = [];
            }
        }

        // ✅ Delete old images that are being replaced
        if (newImages.length > 0) {
            updatedImages.forEach(deleteFile); // Delete old images
            updatedImages = newImages; // Replace with new images
        }

        // ✅ Update Product in Database
        const updatedProduct = await Product.updateProduct(req.params.id, { 
            name, sku, price, weight, width, height, depth, categoryId, subcategoryId, description, 
            mainImage: newMainImage, 
            images: updatedImages
        });

        res.json({ message: "✅ Product updated successfully!", product: updatedProduct });
    } catch (error) {
        console.error("❌ Error updating product:", error);
        res.status(500).json({ message: "Error updating product", error });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }

        console.log("🛠 Product Data:", product); // Debugging log

        // ✅ Function to safely delete files
        const deleteFile = (filePath) => {
            if (filePath) {
                // ✅ Normalize path for correct location
                const normalizedPath = path.join(__dirname, "..", "..", filePath.replace(/\\/g, "/"));

                console.log("🔍 Attempting to delete:", normalizedPath); // Debugging log

                fs.access(normalizedPath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlink(normalizedPath, (unlinkErr) => {
                            if (unlinkErr) {
                                console.error("❌ Error deleting file:", unlinkErr);
                            } else {
                                console.log("✅ Deleted successfully:", normalizedPath);
                            }
                        });
                    } else {
                        console.warn("⚠ File not found:", normalizedPath);
                    }
                });
            }
        };

        // ✅ Delete Main Image if Exists
        if (product.mainImage) {
            deleteFile(product.mainImage);
        }

        // ✅ Ensure `images` is an array before looping
        let images = product.images;
        if (typeof images === "string") {
            try {
                images = JSON.parse(images); // Convert JSON string to array if stored as string
            } catch (e) {
                images = []; // Default to empty array if parsing fails
            }
        }

        // ✅ Delete Additional Images if They Exist
        if (Array.isArray(images)) {
            images.forEach(deleteFile);
        } else {
            console.warn("⚠ Product images is not an array:", images);
        }

        // ✅ Delete Product from Database
        const deleteResult = await Product.deleteProduct(req.params.id);

        if (!deleteResult.affectedRows) {
            return res.status(500).json({ message: "Failed to delete product from database." });
        }

        res.json({ message: "✅ Product and its images deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting product:", error);
        res.status(500).json({ message: "Error deleting product", error: error.message || error });
    }
};