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
    const { title, description, status, priority } = req.body;
    
    const newTask = new Task({
      title,
      description,
      status,
      priority
    });

    const savedTask = await newTask.save(); // Save it to MongoDB Atlas
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task', error: error.message });
  }
});

// 3. UPDATE AN EXISTING TASK STATUS (Update)
// URL: http://localhost:5000/api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the task by its MongoDB unique ID and update its pipeline column field
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Tells MongoDB to return the updated object back to the client
    );

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task status', error: error.message });
  }
});

module.exports = router;