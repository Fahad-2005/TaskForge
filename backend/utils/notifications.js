const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser } = require('../socket');

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

  const notification = await Notification.create({
    recipient: recipientId,
    actor: inviterId,
    type: 'workspace_invite',
    message: `${inviterName} invited you to join ${workspaceName}`,
    workspace: workspaceId,
    inviteStatus: 'pending',
    read: false,
  });
  const populated = await Notification.findById(notification._id)
    .populate('actor', 'name email')
    .populate('workspace', 'name');
  emitToUser(recipientId, 'notification:created', populated);
  return populated;
}

async function createTaskAssignedNotification({ recipientId, actorId, taskId, taskTitle }) {
  if (!recipientId || !taskId) return null;
  if (actorId && recipientId.toString() === actorId.toString()) return null;

  const actor = actorId ? await User.findById(actorId) : null;
  const actorName = actor?.name || 'Someone';

  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId || null,
    type: 'task_assigned',
    message: `You have been assigned a new task: ${taskTitle}`,
    task: taskId,
    read: false,
  });
  const populated = await Notification.findById(notification._id)
    .populate('actor', 'name email')
    .populate('task', 'title');
  emitToUser(recipientId, 'notification:created', populated);
  return populated;
}

module.exports = {
  createWorkspaceInviteNotification,
  createTaskAssignedNotification,
};
