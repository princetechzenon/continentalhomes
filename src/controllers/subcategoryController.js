const Subcategory = require("../models/subcategoryModel");

exports.addSubcategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        if (!name || !categoryId) {
            return res.status(400).json({ message: "Subcategory name and category ID are required!" });
        }

        const subcategory = await Subcategory.createSubcategory(name, categoryId);
        res.status(201).json({ message: "Subcategory added!", subcategory });
    } catch (error) {
        res.status(500).json({ message: "Error adding subcategory", error });
    }
};

exports.getSubcategories = async (req, res) => {
    try {
        let { page, limit, search } = req.query;
        
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const subcategories = await Subcategory.getFilteredSubcategories(search, limit, offset);
        const totalSubcategories = await Subcategory.getSubcategoryCount(search);
        const totalPages = Math.ceil(totalSubcategories / limit);

        res.json({
            subcategories,
            currentPage: page,
            totalPages,
            totalSubcategories
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subcategories", error });
    }
};

exports.getSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.getSubcategoryById(req.params.id);
        if (!subcategory) return res.status(404).json({ message: "Subcategory not found!" });

        res.json({ subcategory });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subcategory", error });
    }
};

exports.updateSubcategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        if (!name || !categoryId) return res.status(400).json({ message: "Subcategory name and category ID are required!" });

        const subcategory = await Subcategory.updateSubcategory(req.params.id, name, categoryId);
        res.json({ message: "Subcategory updated!", subcategory });
    } catch (error) {
        res.status(500).json({ message: "Error updating subcategory", error });
    }
};

exports.deleteSubcategory = async (req, res) => {
    try {
        await Subcategory.deleteSubcategory(req.params.id);
        res.json({ message: "Subcategory deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting subcategory", error });
    }
};
