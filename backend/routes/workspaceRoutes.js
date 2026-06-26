const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// 🏢 1. CREATE A NEW WORKSPACE
// URL: http://localhost:5000/api/workspaces
router.post('/', async (req, res) => {
  try {
    const { name, ownerId } = req.body;

    const newWorkspace = new Workspace({
      name,
      owner: ownerId,
      members: [ownerId] // Owner is automatically the first member
    });

    const savedWorkspace = await newWorkspace.save();
    res.status(201).json(savedWorkspace);
  } catch (error) {
    res.status(400).json({ message: 'Error creating workspace', error: error.message });
  }
});

// ✉️ 2. INVITE A USER TO WORKSPACE BY EMAIL
// URL: http://localhost:5000/api/workspaces/:workspaceId/invite
router.post('/:workspaceId/invite', async (req, res) => {
  try {
    const { email } = req.body;
    const { workspaceId } = req.params;

    // A. Check if the invited user even exists in TaskForge
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    // B. Find the target workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // C. Check if the user is already a member of this workspace
    if (workspace.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    // D. Add the user's unique ID to the workspace members array
    workspace.members.push(userToInvite._id);
    await workspace.save();

    res.status(200).json({ message: 'User added to workspace successfully!', workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server invitation error', error: error.message });
  }
});

module.exports = router;