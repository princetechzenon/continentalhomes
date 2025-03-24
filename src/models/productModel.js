const db = require("../config/db");
const slugify = require("slugify");

class Product {
    // ✅ Create a New Product with Slug
    static async createProduct({ name, sku, price, weight, width, height, depth, categoryId, subcategoryId, description, mainImage, images }) {
        const slug = slugify(name, { lower: true, strict: true });

        const [result] = await db.execute(
            `INSERT INTO products (name, slug, sku, price, weight, width, height, depth, category_id, subcategory_id, description, main_image, images) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, slug, sku, price, weight, width, height, depth, categoryId, subcategoryId, description, mainImage, JSON.stringify(images)]
        );

        return { id: result.insertId, name, slug, sku, price, categoryId, subcategoryId, description, mainImage, images };
    }

    // ✅ Get All Products with Pagination & Search
    static async getFilteredProducts(search, categoryId, subcategoryId, limit, offset) {
        let query = `SELECT p.*, c.name AS category_name, s.name AS subcategory_name 
                     FROM products p
                     JOIN categories c ON p.category_id = c.id
                     JOIN subcategories s ON p.subcategory_id = s.id`;
        let params = [];

        if (search || categoryId || subcategoryId) {
            query += " WHERE";
            let conditions = [];

            if (search) {
                conditions.push("p.name LIKE ?");
                params.push(`%${search}%`);
            }
            if (categoryId) {
                conditions.push("p.category_id = ?");
                params.push(categoryId);
            }
            if (subcategoryId) {
                conditions.push("p.subcategory_id = ?");
                params.push(subcategoryId);
            }

            query += ` ${conditions.join(" AND ")}`;
        }

        query += " ORDER BY p.id DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.execute(query, params);
        return rows;
    }

    // ✅ Get Total Product Count for Pagination
    static async getProductCount(search, categoryId, subcategoryId) {
        let query = "SELECT COUNT(*) AS count FROM products";
        let params = [];

        if (search || categoryId || subcategoryId) {
            query += " WHERE";
            let conditions = [];

            if (search) {
                conditions.push("name LIKE ?");
                params.push(`%${search}%`);
            }
            if (categoryId) {
                conditions.push("category_id = ?");
                params.push(categoryId);
            }
            if (subcategoryId) {
                conditions.push("subcategory_id = ?");
                params.push(subcategoryId);
            }

            query += ` ${conditions.join(" AND ")}`;
        }

        const [[{ count }]] = await db.execute(query, params);
        return count;
    }

    // ✅ Get Single Product
    static async getProductById(id) {
        const [product] = await db.execute(
            `SELECT p.*, c.name AS category_name, s.name AS subcategory_name 
             FROM products p
             JOIN categories c ON p.category_id = c.id
             JOIN subcategories s ON p.subcategory_id = s.id
             WHERE p.id = ?`,
            [id]
        );
        return product.length ? product[0] : null;
    }

    static async updateProduct(id, { name, sku, price, weight, width, height, depth, categoryId, subcategoryId, description, mainImage, images }) {
        const slug = slugify(name, { lower: true, strict: true });
    
        // Fetch existing product data
        const existingProduct = await this.getProductById(id);
        if (!existingProduct) {
            throw new Error("Product not found!");
        }
    
        // Use existing images if no new ones are provided
        const updatedMainImage = mainImage || existingProduct.main_image;
        let updatedImages = JSON.parse(existingProduct.images || "[]");
    
        // If new images are uploaded, replace existing ones
        if (images.length > 0) {
            updatedImages = images; // Replace with new ones
        }
    
        await db.execute(
            `UPDATE products 
             SET name = ?, slug = ?, sku = ?, price = ?, weight = ?, width = ?, height = ?, depth = ?, 
                 category_id = ?, subcategory_id = ?, description = ?, main_image = ?, images = ? 
             WHERE id = ?`,
            [name, slug, sku, price, weight, width, height, depth, categoryId, subcategoryId, description, updatedMainImage, JSON.stringify(updatedImages), id]
        );
    
        return { id, name, slug, sku, price, categoryId, subcategoryId, description, mainImage: updatedMainImage, images: updatedImages };
    }
    
    
    

    // ✅ Delete Product
    static async deleteProduct(id) {
        await db.execute("DELETE FROM products WHERE id = ?", [id]);
        return { message: "Product deleted successfully!" };
    }
}

module.exports = Product;
