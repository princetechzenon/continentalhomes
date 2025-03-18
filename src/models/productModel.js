const db = require("../config/db");
const slugify = require("slugify");

class Product {
    // ✅ Import Multiple Products
    static async importProducts(products) {
        const values = products.map(p => ([
            p.name, p.sku, p.price, p.weight, p.width,
            p.height, p.depth, p.categoryId, p.subcategoryId,
            p.description, JSON.stringify(p.images), slugify(p.name, { lower: true, strict: true })
        ]));

        const query = `INSERT INTO products 
            (name, sku, price, weight, width, height, depth, category_id, subcategory_id, description, images, slug)
            VALUES ?`;

        await db.query(query, [values]);
    }

    // ✅ Create a New Product
    static async createProduct(data) {
        const slug = slugify(data.name, { lower: true, strict: true });

        const [result] = await db.execute(
            `INSERT INTO products 
            (name, sku, price, weight, width, height, depth, category_id, subcategory_id, description, images, slug) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name, data.sku, data.price, data.weight, data.width,
                data.height, data.depth, data.categoryId, data.subcategoryId,
                data.description, JSON.stringify(data.images), slug
            ]
        );

        return { id: result.insertId, ...data, slug };
    }

    // ✅ Get All Products (Pagination & Search)
    static async getFilteredProducts(search, limit, offset) {
        let query = `SELECT * FROM products`;
        let params = [];

        if (search) {
            query += " WHERE name LIKE ?";
            params.push(`%${search}%`);
        }

        query += " ORDER BY id DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.execute(query, params);
        return rows;
    }

    // ✅ Get Product by ID
    static async getProductById(id) {
        const [product] = await db.execute(`SELECT * FROM products WHERE id = ?`, [id]);
        return product.length ? product[0] : null;
    }

    // ✅ Update Product
    static async updateProduct(id, data) {
        const slug = slugify(data.name, { lower: true, strict: true });

        await db.execute(
            `UPDATE products SET name = ?, sku = ?, price = ?, weight = ?, width = ?, 
            height = ?, depth = ?, category_id = ?, subcategory_id = ?, description = ?, images = ?, slug = ? WHERE id = ?`,
            [
                data.name, data.sku, data.price, data.weight, data.width,
                data.height, data.depth, data.categoryId, data.subcategoryId,
                data.description, JSON.stringify(data.images), slug, id
            ]
        );

        return { id, ...data, slug };
    }

    // ✅ Delete a Product
    static async deleteProduct(id) {
        await db.execute(`DELETE FROM products WHERE id = ?`, [id]);
        return { message: "Product deleted successfully!" };
    }
}

module.exports = Product;
