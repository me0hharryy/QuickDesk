const express = require('express');
const Joi = require('joi');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Validation schema
const categorySchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().max(200),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i)
});

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const { isActive = true } = req.query;
    
    const query = {};
    if (isActive !== 'all') {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query)
      .populate('createdBy', 'username')
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// Create category (Admin only)
router.post('/', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, color } = value;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      description,
      color: color || '#1976d2',
      createdBy: req.user._id
    });

    await category.save();
    await category.populate('createdBy', 'username');

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// Update category (Admin only)
router.put('/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (value.name && value.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${value.name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    Object.assign(category, value);
    await category.save();
    await category.populate('createdBy', 'username');

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// Toggle category status (Admin only)
router.patch('/:id/toggle-status', auth, roleAuth('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle category status' });
  }
});

// Delete category (Admin only)
router.delete('/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is being used by any tickets
    const Ticket = require('../models/Ticket');
    const ticketCount = await Ticket.countDocuments({ category: req.params.id });

    if (ticketCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It's being used by ${ticketCount} ticket(s)` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

module.exports = router;
