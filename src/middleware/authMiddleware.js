const jwt = require("jsonwebtoken");

exports.verifyAdmin = (req, res, next) => {
    const token = req.header("Authorization");
    
    if (!token) {
        return res.status(401).json({ message: "Access denied! No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: "Unauthorized! Admin access required." });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token!" });
    }
};
