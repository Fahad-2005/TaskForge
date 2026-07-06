const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { createTaskAssignedNotification } = require('../utils/notifications');

const buildTaskUpdates = (body) => {
  const updates = {};
  const fields = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate'];

  fields.forEach((field) => {
    if (body[field] === undefined) return;

    if (field === 'assignedTo') {
      updates.assignedTo = body.assignedTo && String(body.assignedTo).trim() !== '' ? body.assignedTo : null;
    } else if (field === 'dueDate') {
      updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    } else {
      updates[field] = body[field];
    }
  });

  return updates;
};

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, workspace, assignedTo, dueDate, assignedBy } = req.body;

    const newTask = new Task({
      title,
      description,
      status,
      priority,
      workspace,
      assignedTo: assignedTo && String(assignedTo).trim() !== '' ? assignedTo : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const savedTask = await newTask.save();

    if (savedTask.assignedTo) {
      await createTaskAssignedNotification({
        recipientId: savedTask.assignedTo,
        actorId: assignedBy,
        taskId: savedTask._id,
        taskTitle: savedTask.title,
      });
    }

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

    const updates = buildTaskUpdates(req.body);
    const { assignedBy } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    const assigneeChanged =
      updates.assignedTo !== undefined &&
      updates.assignedTo &&
      (!existingTask.assignedTo || existingTask.assignedTo.toString() !== updates.assignedTo.toString());

    if (assigneeChanged) {
      await createTaskAssignedNotification({
        recipientId: updates.assignedTo,
        actorId: assignedBy,
        taskId: updatedTask._id,
        taskTitle: updatedTask.title,
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task fields', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task removed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task', error: error.message });
  }
});

module.exports = router;
