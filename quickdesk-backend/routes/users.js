const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      isActive, 
      search 
    } = req.query;

    let query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get agents for assignment
router.get('/agents', auth, roleAuth('agent', 'admin'), async (req, res) => {
  try {
    const agents = await User.find({ 
      role: { $in: ['agent', 'admin'] },
      isActive: true 
    })
    .select('username email profile')
    .sort({ username: 1 });

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Users can only view their own profile, agents/admins can view any
    if (req.user.role === 'user' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics if requested by admin/agent
    let stats = {};
    if (['admin', 'agent'].includes(req.user.role)) {
      const ticketStats = await Ticket.aggregate([
        { $match: { createdBy: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const assignedStats = await Ticket.aggregate([
        { $match: { assignedTo: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      stats = {
        ticketsCreated: ticketStats,
        ticketsAssigned: assignedStats
      };
    }

    res.json({ user, stats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update user (Admin only, or user updating their own profile)
router.put('/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const isOwnProfile = targetUserId === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateSchema = Joi.object({
      username: Joi.string().min(3).max(30),
      email: Joi.string().email(),
      role: Joi.string().valid('user', 'agent', 'admin'),
      isActive: Joi.boolean(),
      profile: Joi.object({
        firstName: Joi.string().max(50),
        lastName: Joi.string().max(50),
        phone: Joi.string().max(15),
        department: Joi.string().max(100)
      }),
      notifications: Joi.object({
        email: Joi.boolean(),
        browser: Joi.boolean()
      })
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Regular users cannot change role or isActive
    if (!isAdmin) {
      delete value.role;
      delete value.isActive;
    }

    // Check for unique constraints
    if (value.username && value.username !== user.username) {
      const existingUser = await User.findOne({ 
        username: value.username,
        _id: { $ne: targetUserId }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    if (value.email && value.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: value.email,
        _id: { $ne: targetUserId }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update user
    Object.keys(value).forEach(key => {
      if (key === 'profile' || key === 'notifications') {
        user[key] = { ...user[key], ...value[key] };
      } else {
        user[key] = value[key];
      }
    });

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Toggle user status (Admin only)
router.patch('/:id/toggle-status', auth, roleAuth('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot deactivate self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle user status' });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot delete self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Check if user has tickets
    const ticketCount = await Ticket.countDocuments({
      $or: [
        { createdBy: req.params.id },
        { assignedTo: req.params.id }
      ]
    });

    if (ticketCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete user. They have ${ticketCount} associated ticket(s)` 
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});
router.get('/agents', auth, async (req, res) => {
  try {
    const agents = await User.find({ role: { $in: ['agent', 'admin'] } })
      .select('username email')
      .sort({ username: 1 });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});
// Get user dashboard data
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check permissions
    if (req.user.role === 'user' && userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get ticket statistics
    let ticketStats = {};
    
    if (user.role === 'user') {
      // For regular users, show their created tickets
      ticketStats = await Ticket.aggregate([
        { $match: { createdBy: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    } else {
      // For agents/admins, show both created and assigned tickets
      const createdStats = await Ticket.aggregate([
        { $match: { createdBy: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const assignedStats = await Ticket.aggregate([
        { $match: { assignedTo: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      ticketStats = {
        created: createdStats,
        assigned: assignedStats
      };
    }

    // Get recent tickets
    const recentTickets = await Ticket.find({
      $or: [
        { createdBy: user._id },
        ...(user.role !== 'user' ? [{ assignedTo: user._id }] : [])
      ]
    })
    .populate('category', 'name color')
    .populate('createdBy', 'username')
    .populate('assignedTo', 'username')
    .sort({ updatedAt: -1 })
    .limit(5);

    res.json({
      user,
      ticketStats,
      recentTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
