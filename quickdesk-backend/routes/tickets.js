const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { sendTicketNotification } = require('../utils/email');
const mongoose = require('mongoose');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only specific file types are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    files: parseInt(process.env.MAX_FILES) || 5
  }
});

// Validation schemas
const createTicketSchema = Joi.object({
  subject: Joi.string().max(200).required(),
  description: Joi.string().max(2000).required(),
  category: Joi.string().required(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  dueDate: Joi.date().greater('now')
});

const updateTicketSchema = Joi.object({
  subject: Joi.string().max(200),
  description: Joi.string().max(2000),
  status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed'),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
  assignedTo: Joi.string().allow(null),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  dueDate: Joi.date().allow(null),
  estimatedHours: Joi.number().min(0),
  actualHours: Joi.number().min(0)
});

// Create ticket
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { error, value } = createTicketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { subject, description, category, priority, tags, dueDate } = value;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const ticket = new Ticket({
      subject,
      description,
      category,
      priority,
      tags: tags || [],
      dueDate,
      createdBy: req.user._id,
      attachments
    });

    await ticket.save();
    await ticket.populate(['createdBy', 'category', 'assignedTo']);

    // Send notification to agents/admins
    try {
      const agents = await User.find({ 
        role: { $in: ['agent', 'admin'] }, 
        isActive: true,
        'notifications.email': true 
      });

      const emailPromises = agents.map(agent => 
        sendTicketNotification(ticket, 'created', agent)
      );
      
      await Promise.allSettled(emailPromises);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// Get tickets with advanced filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assignedTo,
      createdBy,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      myTickets,
      dateFrom,
      dateTo
    } = req.query;

    // Build query
    let query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    } else if (myTickets === 'true') {
      if (req.user.role === 'agent') {
        query.$or = [
          { createdBy: req.user._id },
          { assignedTo: req.user._id }
        ];
      } else {
        query.createdBy = req.user._id;
      }
    }

    // Additional filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (createdBy) query.createdBy = createdBy;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Search filter
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const tickets = await Ticket.find(query)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email')
      .populate('category', 'name color')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Ticket.countDocuments(query);

    // Get statistics
    const stats = await Ticket.aggregate([
      { $match: req.user.role === 'user' ? { createdBy: req.user._id } : {} },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTickets: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Get ticket by ID - ADD THIS IF MISSING
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching ticket with ID:', req.params.id); // Debug log
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ticket ID format');
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email')
      .populate('category', 'name color description');

    if (!ticket) {
      console.log('Ticket not found in database');
      return res.status(404).json({ error: 'Ticket not found' });
    }

    console.log('Ticket found:', ticket.subject);
    
    res.json({ 
      ticket,
      comments: [] // For now, empty comments
    });
    
  } catch (error) {
    console.error('Ticket detail fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
});


// Get ticket by ID
// Update your existing GET /:id route with this
router.get('/:id', auth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Debug logging
    console.log('🔍 Fetching ticket with ID:', ticketId);
    console.log('🔍 User requesting:', req.user.username);
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      console.log('❌ Invalid ticket ID format');
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }

    // Find ticket with proper error handling
    const ticket = await Ticket.findById(ticketId)
      .populate('createdBy', 'username email profile')
      .populate('assignedTo', 'username email profile')  
      .populate('category', 'name color description')
      .lean(); // Use lean() for better performance

    if (!ticket) {
      console.log('❌ Ticket not found in database:', ticketId);
      return res.status(404).json({ error: 'Ticket not found' });
    }

    console.log('✅ Ticket found:', ticket.subject);

    // Return ticket data
    res.json({
      ticket: ticket,
      comments: [] // Empty for now, we'll add comments later if needed
    });

  } catch (error) {
    console.error('❌ Database error fetching ticket:', error);
    console.error('❌ Error details:', error.message);
    
    // Send specific error based on error type
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch ticket details',
      details: error.message // Remove this in production
    });
  }
});


// Update ticket
router.put('/:id', auth, async (req, res) => {
  try {
    const { error, value } = updateTicketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    const canUpdate = 
      req.user.role === 'admin' ||
      (req.user.role === 'agent') ||
      (req.user.role === 'user' && ticket.createdBy.toString() === req.user._id.toString());

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Users can only update certain fields
    if (req.user.role === 'user') {
      const allowedFields = ['subject', 'description', 'tags'];
      const updateData = {};
      allowedFields.forEach(field => {
        if (value[field] !== undefined) {
          updateData[field] = value[field];
        }
      });
      Object.assign(ticket, updateData);
    } else {
      // Agents and admins can update all fields
      const previousStatus = ticket.status;
      const previousAssignee = ticket.assignedTo;

      Object.assign(ticket, value);

      // Handle status changes
      if (value.status && value.status !== previousStatus) {
        if (value.status === 'Resolved') {
          ticket.isResolved = true;
          ticket.resolvedAt = new Date();
          ticket.resolvedBy = req.user._id;
        }
      }

      // Handle assignment changes
      if (value.assignedTo && value.assignedTo !== previousAssignee?.toString()) {
        // Send notification to newly assigned user
        if (value.assignedTo) {
          const assignedUser = await User.findById(value.assignedTo);
          if (assignedUser && assignedUser.notifications.email) {
            try {
              await sendTicketNotification(ticket, 'assigned', assignedUser);
            } catch (emailError) {
              console.error('Assignment notification failed:', emailError);
            }
          }
        }
      }

      // Send status change notification
      if (value.status && value.status !== previousStatus) {
        const creator = await User.findById(ticket.createdBy);
        if (creator && creator.notifications.email) {
          try {
            await sendTicketNotification(ticket, 'statusChanged', creator);
          } catch (emailError) {
            console.error('Status change notification failed:', emailError);
          }
        }
      }
    }

    await ticket.save();
    await ticket.populate(['createdBy', 'assignedTo', 'category', 'resolvedBy']);

    res.json({
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// Assign ticket (Agents/Admins only)
router.patch('/:id/assign', auth, roleAuth('agent', 'admin'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify assignee exists and is agent/admin
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee || !['agent', 'admin'].includes(assignee.role)) {
        return res.status(400).json({ message: 'Invalid assignee' });
      }
    }

    ticket.assignedTo = assignedTo || null;
    if (assignedTo && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    await ticket.save();
    await ticket.populate(['createdBy', 'assignedTo', 'category']);

    // Send notification
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (assignee && assignee.notifications.email) {
        try {
          await sendTicketNotification(ticket, 'assigned', assignee);
        } catch (emailError) {
          console.error('Assignment notification failed:', emailError);
        }
      }
    }

    res.json({
      message: assignedTo ? 'Ticket assigned successfully' : 'Ticket unassigned successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign ticket' });
  }
});

// Vote on ticket
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    
    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user already voted
    const existingVote = ticket.votedBy.find(
      vote => vote.user.toString() === req.user._id.toString()
    );

    if (existingVote) {
      // Update existing vote
      if (existingVote.voteType === type) {
        return res.status(400).json({ message: 'You have already voted' });
      }

      // Change vote
      if (existingVote.voteType === 'up') {
        ticket.upvotes -= 1;
        ticket.downvotes += 1;
      } else {
        ticket.downvotes -= 1;
        ticket.upvotes += 1;
      }
      
      existingVote.voteType = type;
      existingVote.votedAt = new Date();
    } else {
      // New vote
      if (type === 'up') {
        ticket.upvotes += 1;
      } else {
        ticket.downvotes += 1;
      }

      ticket.votedBy.push({
        user: req.user._id,
        voteType: type,
        votedAt: new Date()
      });
    }

    await ticket.save();

    res.json({
      message: 'Vote recorded successfully',
      upvotes: ticket.upvotes,
      downvotes: ticket.downvotes,
      userVote: type
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record vote' });
  }
});

// Add comment to ticket
router.post('/:id/comments', auth, upload.array('attachments', 3), async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    const canComment = 
      req.user.role === 'admin' ||
      req.user.role === 'agent' ||
      (req.user.role === 'user' && ticket.createdBy.toString() === req.user._id.toString());

    if (!canComment) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const comment = new Comment({
      ticket: ticket._id,
      user: req.user._id,
      message: message.trim(),
      isInternal: req.user.role === 'user' ? false : Boolean(isInternal),
      attachments
    });

    await comment.save();
    await comment.populate('user', 'username email profile');

    // Update ticket's updatedAt
    ticket.updatedAt = new Date();
    await ticket.save();

    // Send notification to ticket creator (if not the commenter)
    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      const creator = await User.findById(ticket.createdBy);
      if (creator && creator.notifications.email) {
        try {
          await sendTicketNotification(ticket, 'commented', creator);
        } catch (emailError) {
          console.error('Comment notification failed:', emailError);
        }
      }
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Get ticket statistics (Agents/Admins only)
router.get('/admin/statistics', auth, roleAuth('agent', 'admin'), async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Basic statistics
    const totalTickets = await Ticket.countDocuments(dateFilter);
    const openTickets = await Ticket.countDocuments({ ...dateFilter, status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ ...dateFilter, status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ ...dateFilter, status: 'Resolved' });
    const closedTickets = await Ticket.countDocuments({ ...dateFilter, status: 'Closed' });

    // Priority distribution
    const priorityStats = await Ticket.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryStats = await Ticket.aggregate([
      { $match: dateFilter },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $group: { _id: '$categoryInfo.name', count: { $sum: 1 } } }
    ]);

    // Agent performance
    const agentStats = await Ticket.aggregate([
      { $match: { ...dateFilter, assignedTo: { $ne: null } } },
      { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'agentInfo' } },
      { $unwind: '$agentInfo' },
      {
        $group: {
          _id: '$agentInfo.username',
          totalAssigned: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      overview: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets
      },
      priorityStats,
      categoryStats,
      agentStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
