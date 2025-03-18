const db = require("../config/db");

class User {
    static async createUser(name, email, password, isAdmin = false) {
        const [result] = await db.execute(
            "INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)", 
            [name, email, password, isAdmin]
        );
        return { id: result.insertId, name, email, isAdmin };
    }

    static async findUserByEmail(email) {
        const [rows] = await db.execute(
            "SELECT id, name, email, password, isAdmin FROM users WHERE email = ?", 
            [email]
        );
        return rows.length ? rows[0] : null;
    }
}

module.exports = User;

