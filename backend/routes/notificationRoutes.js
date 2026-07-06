const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId })
      .populate('actor', 'name email')
      .populate('workspace', 'name')
      .populate('task', 'title')
      .sort({ read: 1, createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

router.post('/:id/accept-invite', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.type !== 'workspace_invite') {
      return res.status(404).json({ message: 'Invite notification not found' });
    }
    if (notification.inviteStatus !== 'pending') {
      return res.status(400).json({ message: 'This invite has already been responded to' });
    }

    const workspace = await Workspace.findById(notification.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace no longer exists' });
    }

    const recipientId = notification.recipient.toString();
    if (!workspace.members.some((id) => id.toString() === recipientId)) {
      workspace.members.push(notification.recipient);
      await workspace.save();
    }

    notification.inviteStatus = 'accepted';
    notification.read = true;
    await notification.save();

    const populated = await Notification.findById(notification._id)
      .populate('actor', 'name email')
      .populate('workspace', 'name');

    res.status(200).json({ message: 'Invite accepted', notification: populated, workspace });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting invite', error: error.message });
  }
});

router.post('/:id/decline-invite', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.type !== 'workspace_invite') {
      return res.status(404).json({ message: 'Invite notification not found' });
    }
    if (notification.inviteStatus !== 'pending') {
      return res.status(400).json({ message: 'This invite has already been responded to' });
    }

    notification.inviteStatus = 'declined';
    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Invite declined', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error declining invite', error: error.message });
  }
});

module.exports = router;
