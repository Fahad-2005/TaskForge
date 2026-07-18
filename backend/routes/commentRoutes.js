const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { requireAuth } = require('../middleware/auth');
const { getWorkspaceForUser } = require('../middleware/workspaceAccess');
const { recordActivity } = require('../utils/activity');
const { emitToWorkspace } = require('../socket');
const {
  createMentionNotifications,
  createTaskCommentNotification,
} = require('../utils/notifications');

router.use(requireAuth);

async function loadAccessibleTask(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return { task: null, workspace: null };
  const workspace = await getWorkspaceForUser(task.workspace, userId);
  return { task, workspace };
}

router.get('/task/:taskId', async (req, res) => {
  try {
    const { task, workspace } = await loadAccessibleTask(req.params.taskId, req.user._id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!workspace) return res.status(403).json({ message: 'Workspace access denied' });

    const comments = await Comment.find({ task: task._id })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error loading comments', error: error.message });
  }
});

router.post('/task/:taskId', async (req, res) => {
  try {
    const body = String(req.body.body || '').trim();
    if (!body) return res.status(400).json({ message: 'Comment cannot be empty' });
    if (body.length > 2000) return res.status(400).json({ message: 'Comment is too long' });

    const { task, workspace } = await loadAccessibleTask(req.params.taskId, req.user._id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!workspace) return res.status(403).json({ message: 'Workspace access denied' });

    const created = await Comment.create({
      task: task._id,
      workspace: workspace._id,
      author: req.user._id,
      body,
    });
    const comment = await Comment.findById(created._id).populate('author', 'name email');
    const activity = await recordActivity({
      task: task._id,
      workspace: workspace._id,
      actor: req.user._id,
      type: 'comment.created',
      message: `commented on "${task.title}"`,
      metadata: { commentId: comment._id },
    });

    const populatedWorkspace = await Workspace.findById(workspace._id).populate('members', 'name email');
    const mentions = await createMentionNotifications({
      body,
      members: populatedWorkspace?.members || [],
      actorId: req.user._id,
      actorName: req.user.name,
      taskId: task._id,
      taskTitle: task.title,
      workspaceId: workspace._id,
    });

    const mentionedIds = new Set(mentions.map((item) => String(item.recipient?._id || item.recipient)));
    if (task.assignedTo && !mentionedIds.has(String(task.assignedTo))) {
      await createTaskCommentNotification({
        recipientId: task.assignedTo,
        actorId: req.user._id,
        actorName: req.user.name,
        taskId: task._id,
        taskTitle: task.title,
        workspaceId: workspace._id,
      });
    }

    emitToWorkspace(workspace._id, 'comment:created', comment);
    emitToWorkspace(workspace._id, 'activity:created', activity);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the comment author can delete it' });
    }

    const workspace = await getWorkspaceForUser(comment.workspace, req.user._id);
    if (!workspace) return res.status(403).json({ message: 'Workspace access denied' });

    await comment.deleteOne();
    const activity = await recordActivity({
      task: comment.task,
      workspace: comment.workspace,
      actor: req.user._id,
      type: 'comment.deleted',
      message: 'deleted a comment',
      metadata: { commentId: comment._id },
    });

    emitToWorkspace(comment.workspace, 'comment:deleted', {
      _id: comment._id,
      task: comment.task,
    });
    emitToWorkspace(comment.workspace, 'activity:created', activity);
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

module.exports = router;
