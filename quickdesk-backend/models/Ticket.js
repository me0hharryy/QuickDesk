const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['up', 'down']
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate ticket number
ticketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  
  this.updatedAt = new Date();
  
  // Update resolved status
  if (this.status === 'Resolved' && !this.isResolved) {
    this.isResolved = true;
    this.resolvedAt = new Date();
  }
  
  next();
});

// Index for better search performance
ticketSchema.index({ subject: 'text', description: 'text' });
ticketSchema.index({ status: 1, createdBy: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
