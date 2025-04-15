const db = require("../config/db");

class FAQ {
    // ✅ Get FAQ
    static async getFAQ() {
        const [result] = await db.execute("SELECT * FROM faq LIMIT 1");
        return result.length ? result[0] : { title: "", description: "", banner_image: null };
    }

    // ✅ Update FAQ
    static async updateFAQ({ title, description, bannerImage }) {
        const [result] = await db.execute(
            `UPDATE faq SET title = ?, description = ?, banner_image = ? WHERE id = 1`,
            [title, description, bannerImage]
        );
        return result;
    }
}

module.exports = FAQ;
