const db = require("../config/db");
const slugify = require("slugify");

class Category {
    // ✅ Create a New Category with Slug
    static async createCategory(name) {
        const slug = slugify(name, { lower: true, strict: true });

        const [result] = await db.execute(
            "INSERT INTO categories (name, slug) VALUES (?, ?)",
            [name, slug]
        );

        return { id: result.insertId, name, slug };
    }

    // ✅ Get All Categories (Paginated & Searchable)
    static async getFilteredCategories(search, limit, offset) {
        let query = "SELECT * FROM categories";
        let params = [];
    
        if (search) {
            query += " WHERE name LIKE ?";
            params.push(`%${search}%`);
        }
    
        // ✅ Ensure limit & offset are valid numbers
        limit = Number(limit) || 10;
        offset = Number(offset) || 0;
    
        query += " ORDER BY id DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);
    
        console.log("Executing Query:", query, "Params:", params);
    
        try {
            // ✅ Use `.query()` instead of `.execute()`
            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            console.error("❌ SQL Execution Error:", error);
            throw error;
        }
    }
    

    // ✅ Get Category by ID
    static async getCategoryById(id) {
        const [category] = await db.execute("SELECT * FROM categories WHERE id = ?", [id]);
        return category.length ? category[0] : null;
    }

    // ✅ Get Total Categories Count (for Pagination)
    static async getCategoryCount(search) {
        let query = "SELECT COUNT(*) AS count FROM categories";
        let params = [];

        if (search) {
            query += " WHERE name LIKE ?";
            params.push(`%${search}%`);
        }

        const [[{ count }]] = await db.execute(query, params);
        return count;
    }

    // ✅ Update Category with New Name & Slug
    static async updateCategory(id, name) {
        const slug = slugify(name, { lower: true, strict: true });

        await db.execute(
            "UPDATE categories SET name = ?, slug = ? WHERE id = ?",
            [name, slug, id]
        );

        return { id, name, slug };
    }

    // ✅ Delete a Category by ID
    static async deleteCategory(id) {
        await db.execute("DELETE FROM categories WHERE id = ?", [id]);
        return { message: "Category deleted successfully!" };
    }
}

module.exports = Category;
