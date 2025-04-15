const path = require("path");
const fs = require("fs");
const ContactUs = require("../models/contactModel");

// ✅ Get Contact Us Details
exports.getContactUs = async (req, res) => {
    try {
        const contactData = await ContactUs.getContactUs();
        res.json(contactData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Contact Us details", error });
    }
};

// ✅ Update Contact Us
exports.updateContactUs = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required!" });
        }

        const existingContact = await ContactUs.getContactUs();
        let newBannerImage = req.file ? req.file.path : existingContact?.banner_image;

        // ✅ Delete old banner image if a new one is uploaded
        if (req.file && existingContact?.banner_image) {
            const oldImagePath = path.join(__dirname, "..", "..", existingContact.banner_image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // ✅ Update Contact Us
        await ContactUs.updateContactUs({ title, description, bannerImage: newBannerImage });

        res.json({ message: "✅ Contact Us updated successfully!", title, description, bannerImage: newBannerImage });
    } catch (error) {
        res.status(500).json({ message: "Error updating Contact Us", error });
    }
};
