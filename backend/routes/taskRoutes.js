const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Workspace = require('../models/Workspace');
const { createTaskAssignedNotification } = require('../utils/notifications');
const { requireAuth } = require('../middleware/auth');
const { getWorkspaceForUser } = require('../middleware/workspaceAccess');
const { recordActivity } = require('../utils/activity');
const { emitToWorkspace } = require('../socket');

router.use(requireAuth);

const buildTaskUpdates = (body) => {
  const updates = {};
  const fields = ['title', 'description', 'status', 'priority', 'assignedTo', 'startDate', 'dueDate'];

  fields.forEach((field) => {
    if (body[field] === undefined) return;

    if (field === 'assignedTo') {
      updates.assignedTo = body.assignedTo && String(body.assignedTo).trim() !== '' ? body.assignedTo : null;
    } else if (field === 'startDate' || field === 'dueDate') {
      updates[field] = body[field] ? new Date(body[field]) : null;
    } else {
      updates[field] = body[field];
    }
  });

  return updates;
};

function validateDateRange(startDate, dueDate) {
  if (startDate && Number.isNaN(new Date(startDate).getTime())) return 'Invalid start date';
  if (dueDate && Number.isNaN(new Date(dueDate).getTime())) return 'Invalid due date';
  if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
    return 'Due date must be on or after the start date';
  }
  return null;
}

async function validateAssignee(workspaceId, assigneeId) {
  if (!assigneeId) return true;
  const workspace = await Workspace.findById(workspaceId);
  return Boolean(
    workspace &&
    workspace.members.some((memberId) => memberId.toString() === assigneeId.toString())
  );
}

router.get('/', async (req, res) => {
  try {
    const { workspace: workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ message: 'Workspace query is required' });
    const workspace = await getWorkspaceForUser(workspaceId, req.user._id);
    if (!workspace) return res.status(403).json({ message: 'Workspace access denied' });

    const tasks = await Task.find({ workspace: workspaceId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, workspace, assignedTo, startDate, dueDate } = req.body;
    const accessibleWorkspace = await getWorkspaceForUser(workspace, req.user._id);
    if (!accessibleWorkspace) {
      return res.status(403).json({ message: 'Workspace access denied' });
    }

    const dateError = validateDateRange(startDate, dueDate);
    if (dateError) return res.status(400).json({ message: dateError });
    if (!(await validateAssignee(workspace, assignedTo))) {
      return res.status(400).json({ message: 'Assignee must be a workspace member' });
    }

    const newTask = new Task({
      title,
      description,
      status,
      priority,
      workspace,
      assignedTo: assignedTo && String(assignedTo).trim() !== '' ? assignedTo : null,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const savedTask = await newTask.save();
    const activity = await recordActivity({
      task: savedTask._id,
      workspace: savedTask.workspace,
      actor: req.user._id,
      type: 'task.created',
      message: `created "${savedTask.title}"`,
    });

    if (savedTask.assignedTo) {
      await createTaskAssignedNotification({
        recipientId: savedTask.assignedTo,
        actorId: req.user._id,
        taskId: savedTask._id,
        taskTitle: savedTask.title,
      });
    }

    emitToWorkspace(savedTask.workspace, 'task:created', savedTask);
    emitToWorkspace(savedTask.workspace, 'activity:created', activity);
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Mongoose Task Error:', error);
    res.status(400).json({
      message: error.message || 'Database validation failed',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = await getWorkspaceForUser(existingTask.workspace, req.user._id);
    if (!workspace) return res.status(403).json({ message: 'Workspace access denied' });

    const updates = buildTaskUpdates(req.body);
    const nextStart = updates.startDate !== undefined ? updates.startDate : existingTask.startDate;
    const nextDue = updates.dueDate !== undefined ? updates.dueDate : existingTask.dueDate;
    const dateError = validateDateRange(nextStart, nextDue);
    if (dateError) return res.status(400).json({ message: dateError });
    if (updates.assignedTo && !(await validateAssignee(existingTask.workspace, updates.assignedTo))) {
      return res.status(400).json({ message: 'Assignee must be a workspace member' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    const changed = {};
    Object.keys(updates).forEach((field) => {
      const before = existingTask[field] == null ? null : String(existingTask[field]);
      const after = updates[field] == null ? null : String(updates[field]);
      if (before !== after) changed[field] = { before, after };
    });

    const assigneeChanged =
      updates.assignedTo !== undefined &&
      updates.assignedTo &&
      (!existingTask.assignedTo || existingTask.assignedTo.toString() !== updates.assignedTo.toString());

    if (assigneeChanged) {
      await createTaskAssignedNotification({
        recipientId: updates.assignedTo,
        actorId: req.user._id,
        taskId: updatedTask._id,
        taskTitle: updatedTask.title,
      });
    }

    let type = 'task.updated';
    let message = `updated "${updatedTask.title}"`;
    if (changed.status) {
      type = 'task.status_changed';
      message = `moved "${updatedTask.title}" to ${updatedTask.status}`;
    } else if (changed.assignedTo) {
      type = 'task.assigned';
      message = `changed the assignee for "${updatedTask.title}"`;
    } else if (changed.startDate || changed.dueDate) {
      type = 'task.dates_changed';
      message = `rescheduled "${updatedTask.title}"`;
    }

    const activity = await recordActivity({
      task: updatedTask._id,
      workspace: updatedTask.workspace,
      actor: req.user._id,
      type,
      message,
      metadata: { changed },
    });

    emitToWorkspace(updatedTask.workspace, 'task:updated', updatedTask);
    emitToWorkspace(updatedTask.workspace, 'activity:created', activity);
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task fields', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const workspace = await getWorkspaceForUser(task.workspace, req.user._id);
    if (!workspace) return res.status(403).json({ message: 'Workspace access denied' });

    const activity = await recordActivity({
      task: task._id,
      workspace: task.workspace,
      actor: req.user._id,
      type: 'task.deleted',
      message: `deleted "${task.title}"`,
      metadata: { title: task.title },
    });
    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();

    emitToWorkspace(task.workspace, 'task:deleted', { _id: task._id });
    emitToWorkspace(task.workspace, 'activity:created', activity);
    res.status(200).json({ message: 'Task removed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task', error: error.message });
  }
});

module.exports = router;
