const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Comment message is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number
  }],
  editedAt: Date,
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

commentSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
