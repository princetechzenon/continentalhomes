const path = require("path");
const fs = require("fs");
const FAQ = require("../models/faqModel");

// ✅ Get FAQ Details
exports.getFAQ = async (req, res) => {
    try {
        const faqData = await FAQ.getFAQ();
        res.json(faqData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching FAQ details", error });
    }
};

// ✅ Update FAQ
exports.updateFAQ = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required!" });
        }

        const existingFAQ = await FAQ.getFAQ();
        let newBannerImage = req.file ? req.file.path : existingFAQ?.banner_image;

        // ✅ Delete old banner image if a new one is uploaded
        if (req.file && existingFAQ?.banner_image) {
            const oldImagePath = path.join(__dirname, "..", "..", existingFAQ.banner_image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // ✅ Update FAQ
        await FAQ.updateFAQ({ title, description, bannerImage: newBannerImage });

        res.json({ message: "✅ FAQ updated successfully!", title, description, bannerImage: newBannerImage });
    } catch (error) {
        res.status(500).json({ message: "Error updating FAQ", error });
    }
};
