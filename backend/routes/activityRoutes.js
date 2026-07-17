const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');
const { getWorkspaceForUser } = require('../middleware/workspaceAccess');

router.use(requireAuth);

router.get('/task/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const workspace = await getWorkspaceForUser(task.workspace, req.user._id);
    if (!workspace) return res.status(403).json({ message: 'Workspace access denied' });

    const activities = await Activity.find({ task: task._id })
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error loading activity', error: error.message });
  }
});

module.exports = router;
