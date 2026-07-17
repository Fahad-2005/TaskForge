const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'task.created',
        'task.updated',
        'task.status_changed',
        'task.assigned',
        'task.dates_changed',
        'task.deleted',
        'comment.created',
        'comment.deleted',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

ActivitySchema.index({ task: 1, createdAt: -1 });
ActivitySchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
