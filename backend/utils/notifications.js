const Notification = require('../models/Notification');
const User = require('../models/User');

async function createWorkspaceInviteNotification({ recipientId, inviterId, workspaceId, workspaceName }) {
  const inviter = await User.findById(inviterId);
  const inviterName = inviter?.name || 'Someone';

  const existing = await Notification.findOne({
    recipient: recipientId,
    workspace: workspaceId,
    type: 'workspace_invite',
    inviteStatus: 'pending',
  });

  if (existing) return existing;

  return Notification.create({
    recipient: recipientId,
    actor: inviterId,
    type: 'workspace_invite',
    message: `${inviterName} invited you to join ${workspaceName}`,
    workspace: workspaceId,
    inviteStatus: 'pending',
    read: false,
  });
}

async function createTaskAssignedNotification({ recipientId, actorId, taskId, taskTitle }) {
  if (!recipientId || !taskId) return null;
  if (actorId && recipientId.toString() === actorId.toString()) return null;

  const actor = actorId ? await User.findById(actorId) : null;
  const actorName = actor?.name || 'Someone';

  return Notification.create({
    recipient: recipientId,
    actor: actorId || null,
    type: 'task_assigned',
    message: `You have been assigned a new task: ${taskTitle}`,
    task: taskId,
    read: false,
  });
}

module.exports = {
  createWorkspaceInviteNotification,
  createTaskAssignedNotification,
};
