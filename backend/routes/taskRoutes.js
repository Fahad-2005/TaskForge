const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Import our Mongoose model

// 1. GET ALL TASKS (Read)
// URL: http://localhost:5000/api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // Get all tasks, newest first
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// 2. CREATE A NEW TASK (Write)
// URL: http://localhost:5000/api/tasks

router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, workspace, assignedTo } = req.body;

    // Create the task object
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      workspace, // Must be a valid MongoDB ObjectId string from activeWorkspace
      assignedTo: assignedTo && assignedTo.trim() !== "" ? assignedTo : null // Clear empty strings
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    // 🚨 This prints the real reason (e.g., CastError, ValidationError) in your server terminal
    console.error("Mongoose Task Error:", error); 
    
    res.status(400).json({ 
      message: error.message || 'Database validation failed' 
    });
  }
});

// 3. UPDATE AN EXISTING TASK STATUS (Update)
// URL: http://localhost:5000/api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        description, 
        status, 
        priority, 
        assignedTo: assignedTo && assignedTo.trim() !== "" ? assignedTo : null 
      },
      { new: true } // Returns the newly updated database document
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task fields', error: error.message });
  }
});

// 🗑️ 2. DELETE A TASK PERMANENTLY
// URL: http://localhost:5000/api/tasks/:id
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