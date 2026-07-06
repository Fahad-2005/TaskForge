const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createWorkspaceInviteNotification } = require('../utils/notifications');

router.post('/', async (req, res) => {
  try {
    const { name, ownerId } = req.body;

    const newWorkspace = new Workspace({
      name,
      owner: ownerId,
      members: [ownerId],
    });

    const savedWorkspace = await newWorkspace.save();
    res.status(201).json(savedWorkspace);
  } catch (error) {
    res.status(400).json({ message: 'Error creating workspace', error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const owned = await Workspace.find({ owner: userId }).populate('members', 'name email');

    const joined = await Workspace.find({
      members: userId,
      owner: { $ne: userId },
    }).populate('members', 'name email');

    res.status(200).json({ owned, joined });
  } catch (error) {
    res.status(500).json({ message: 'Error loading filtered workspaces', error: error.message });
  }
});

router.post('/:workspaceId/invite', async (req, res) => {
  try {
    const { email, inviterId } = req.body;
    const { workspaceId } = req.params;

    if (!inviterId) {
      return res.status(400).json({ message: 'Inviter ID is required' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.members.some((id) => id.toString() === userToInvite._id.toString())) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    const pendingInvite = await Notification.findOne({
      recipient: userToInvite._id,
      workspace: workspaceId,
      type: 'workspace_invite',
      inviteStatus: 'pending',
    });

    if (pendingInvite) {
      return res.status(400).json({ message: 'An invite is already pending for this user' });
    }

    await createWorkspaceInviteNotification({
      recipientId: userToInvite._id,
      inviterId,
      workspaceId: workspace._id,
      workspaceName: workspace.name,
    });

    res.status(200).json({
      message: `Invite sent to ${userToInvite.name}. They can accept from their notification center.`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server invitation error', error: error.message });
  }
});

module.exports = router;
