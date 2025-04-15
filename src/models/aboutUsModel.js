const db = require("../config/db");

class AboutUs {
    // ✅ Get About Us Data
    static async getAboutUs() {
        const [result] = await db.execute("SELECT * FROM about_us LIMIT 1");
        return result.length ? result[0] : null;
    }

    // ✅ Update About Us Data
    static async updateAboutUs(id, { title, description, bannerImage }) {
        await db.execute(
            `UPDATE about_us SET title = ?, description = ?, banner_image = ? WHERE id = ?`,
            [title, description, bannerImage, id]
        );
        return { id, title, description, bannerImage };
    }
}

module.exports = AboutUs;
