const Workspace = require('../models/Workspace');

async function getWorkspaceForUser(workspaceId, userId) {
  if (!workspaceId) return null;
  return Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { members: userId }],
  });
}

async function requireWorkspaceAccess(req, res, next) {
  try {
    const workspaceId =
      req.params.workspaceId || req.body.workspace || req.query.workspace;
    const workspace = await getWorkspaceForUser(workspaceId, req.user._id);

    if (!workspace) {
      return res.status(403).json({ message: 'You do not have access to this workspace' });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid workspace', error: error.message });
  }
}

module.exports = { getWorkspaceForUser, requireWorkspaceAccess };
