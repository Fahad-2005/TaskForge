const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser } = require('../socket');

async function populateAndEmit(notificationId, recipientId) {
  const populated = await Notification.findById(notificationId)
    .populate('actor', 'name email')
    .populate('workspace', 'name')
    .populate('task', 'title');
  emitToUser(recipientId, 'notification:created', populated);
  return populated;
}

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
  return populateAndEmit(notification._id, recipientId);
}

async function createTaskAssignedNotification({ recipientId, actorId, taskId, taskTitle, workspaceId }) {
  if (!recipientId || !taskId) return null;
  if (actorId && recipientId.toString() === actorId.toString()) return null;

  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId || null,
    type: 'task_assigned',
    message: `You have been assigned a new task: ${taskTitle}`,
    task: taskId,
    workspace: workspaceId || null,
    read: false,
  });
  return populateAndEmit(notification._id, recipientId);
}

function extractMentionTokens(body) {
  const matches = body.match(/@([A-Za-z0-9._-]+(?:\s+[A-Za-z0-9._-]+)?)/g) || [];
  return [...new Set(matches.map((token) => token.slice(1).trim().toLowerCase()))];
}

async function createMentionNotifications({
  body,
  members,
  actorId,
  actorName,
  taskId,
  taskTitle,
  workspaceId,
}) {
  const tokens = extractMentionTokens(body);
  if (!tokens.length || !members?.length) return [];

  const recipients = members.filter((member) => {
    const memberId = member._id?.toString() || member.toString();
    if (memberId === actorId.toString()) return false;
    const name = (member.name || '').toLowerCase();
    const first = name.split(/\s+/)[0];
    return tokens.some((token) => name === token || first === token || name.startsWith(token));
  });

  const created = [];
  for (const member of recipients) {
    const notification = await Notification.create({
      recipient: member._id,
      actor: actorId,
      type: 'comment_mention',
      message: `${actorName} mentioned you in "${taskTitle}"`,
      task: taskId,
      workspace: workspaceId,
      read: false,
    });
    created.push(await populateAndEmit(notification._id, member._id));
  }
  return created;
}

async function createTaskCommentNotification({
  recipientId,
  actorId,
  actorName,
  taskId,
  taskTitle,
  workspaceId,
}) {
  if (!recipientId || recipientId.toString() === actorId.toString()) return null;

  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type: 'task_comment',
    message: `${actorName} commented on "${taskTitle}"`,
    task: taskId,
    workspace: workspaceId,
    read: false,
  });
  return populateAndEmit(notification._id, recipientId);
}

module.exports = {
  createWorkspaceInviteNotification,
  createTaskAssignedNotification,
  createMentionNotifications,
  createTaskCommentNotification,
  extractMentionTokens,
};
