const Category = require("../models/categoryModel");

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Category name is required!" });

        const category = await Category.createCategory(name);
        res.status(201).json({ message: "Category added!", category });
    } catch (error) {
        res.status(500).json({ message: "Error adding category", error });
    }
};

exports.getCategories = async (req, res) => {
    try {
        let { page, limit, search } = req.query;
        
        // Default values if not provided
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        // Fetch filtered categories based on search query
        const categories = await Category.getFilteredCategories(search, limit, offset);
        
        // Get total count for pagination
        const totalCategories = await Category.getCategoryCount(search);
        const totalPages = Math.ceil(totalCategories / limit);

        res.json({
            categories,
            currentPage: page,
            totalPages,
            totalCategories
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.getCategoryById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found!" });

        res.json({ category });
    } catch (error) {
        res.status(500).json({ message: "Error fetching category", error });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Category name is required!" });

        const category = await Category.updateCategory(req.params.id, name);
        res.json({ message: "Category updated!", category });
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.deleteCategory(req.params.id);
        res.json({ message: "Category deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
};
