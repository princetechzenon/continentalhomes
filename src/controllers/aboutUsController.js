const AboutUs = require("../models/aboutUsModel");
const path = require("path");
const fs = require("fs");

// ✅ Get About Us
exports.getAboutUs = async (req, res) => {
    try {
        const aboutUs = await AboutUs.getAboutUs();
        if (!aboutUs) return res.status(404).json({ message: "No data found!" });

        res.json({ aboutUs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching About Us", error });
    }
};

// ✅ Update About Us
exports.updateAboutUs = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title and Description are required!" });
        }

        // ✅ Fetch existing data
        const existingAboutUs = await AboutUs.getAboutUs();
        if (!existingAboutUs) {
            return res.status(404).json({ message: "About Us data not found!" });
        }

        // ✅ Function to delete old banner image
        const deleteFile = (filePath) => {
            if (filePath) {
                const normalizedPath = path.join(__dirname, "..", "..", filePath.replace(/\\/g, "/"));

                if (fs.existsSync(normalizedPath)) {
                    fs.unlinkSync(normalizedPath);
                }
            }
        };

        let newBannerImage = req.file ? req.file.path : null;

        // ✅ Delete old image if a new one is uploaded
        if (newBannerImage && existingAboutUs.banner_image) {
            deleteFile(existingAboutUs.banner_image);
        } else {
            newBannerImage = existingAboutUs.banner_image; // Keep old image if no new image is uploaded
        }

        // ✅ Update Database
        const updatedAboutUs = await AboutUs.updateAboutUs(existingAboutUs.id, { title, description, bannerImage: newBannerImage });

        res.json({ message: "About Us updated successfully!", aboutUs: updatedAboutUs });
    } catch (error) {
        res.status(500).json({ message: "Error updating About Us", error });
    }
};
