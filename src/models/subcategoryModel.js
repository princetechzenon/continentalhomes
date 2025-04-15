const db = require("../config/db");
const slugify = require("slugify");

class Subcategory {
    // ✅ Create a New Subcategory with Slug
    static async createSubcategory(name, categoryId) {
        const slug = slugify(name, { lower: true, strict: true });

        const [result] = await db.execute(
            "INSERT INTO subcategories (name, slug, category_id) VALUES (?, ?, ?)",
            [name, slug, categoryId]
        );

        return { id: result.insertId, name, slug, categoryId };
    }

   // ✅ Get All Subcategories (Paginated & Searchable)
static async getFilteredSubcategories(search, limit, offset) {
    let query = `
        SELECT s.*, c.name AS category_name 
        FROM subcategories s 
        JOIN categories c ON s.category_id = c.id`;
    
    let params = [];

    if (search) {
        query += " WHERE s.name LIKE ?";
        params.push(`%${search}%`);
    }

    query += " ORDER BY s.id DESC LIMIT ? OFFSET ?";

    // ✅ Ensure limit & offset are valid numbers
    limit = Number(limit) || 10;
    offset = Number(offset) || 0;
    params.push(limit, offset);

    console.log("Executing Query:", query, "Params:", params);

    try {
        // ✅ Use `.query()` instead of `.execute()` for better compatibility
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error("❌ SQL Execution Error:", error);
        throw error;
    }
}


    // ✅ Get Subcategory by ID
    static async getSubcategoryById(id) {
        const [subcategory] = await db.execute(
            `SELECT s.*, c.name AS category_name 
             FROM subcategories s 
             JOIN categories c ON s.category_id = c.id
             WHERE s.id = ?`,
            [id]
        );
        return subcategory.length ? subcategory[0] : null;
    }

    // ✅ Get Total Subcategories Count (for Pagination)
    static async getSubcategoryCount(search) {
        let query = "SELECT COUNT(*) AS count FROM subcategories";
        let params = [];

        if (search) {
            query += " WHERE name LIKE ?";
            params.push(`%${search}%`);
        }

        const [[{ count }]] = await db.execute(query, params);
        return count;
    }

    // ✅ Update Subcategory with New Name & Slug
    static async updateSubcategory(id, name, categoryId) {
        const slug = slugify(name, { lower: true, strict: true });

        await db.execute(
            "UPDATE subcategories SET name = ?, slug = ?, category_id = ? WHERE id = ?",
            [name, slug, categoryId, id]
        );

        return { id, name, slug, categoryId };
    }

    // ✅ Delete a Subcategory by ID
    static async deleteSubcategory(id) {
        await db.execute("DELETE FROM subcategories WHERE id = ?", [id]);
        return { message: "Subcategory deleted successfully!" };
    }
}

module.exports = Subcategory;
