const db = require("../config/db");

class ContactUs {
    // ✅ Get Contact Us
    static async getContactUs() {
        const [result] = await db.execute("SELECT * FROM contact_us LIMIT 1");
        return result.length ? result[0] : { title: "", description: "", banner_image: null };
    }

    // ✅ Update Contact Us
    static async updateContactUs({ title, description, bannerImage }) {
        const [result] = await db.execute(
            `UPDATE contact_us SET title = ?, description = ?, banner_image = ? WHERE id = 1`,
            [title, description, bannerImage]
        );
        return result;
    }
}

module.exports = ContactUs;
