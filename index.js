const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors'); 

// MongoDB connection
mongoose.connect('mongodb+srv://prashant:zES90GM1DgOFmyUG@cluster0.ocypbbv.mongodb.net/todo_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// MongoDB Models
const User = mongoose.model('User', {
    username: { type: String, unique: true }, // Use username as a unique identifier
    password: String,
    email: String,
  });
  

const TodoList = mongoose.model('TodoList', {
  title: String,
  userId: String, // Change the field type to String
  tasks: [String],
});

const Task = mongoose.model('Task', {
  content: String,
  completed: Boolean,
  todoListId: mongoose.Types.ObjectId,
});

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

// User registration
app.post('/signup', async (req, res) => {
    try {
      const { username, password, email } = req.body;
  
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      const user = new User({ username, password, email });
      await user.save();
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  // User login
  app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      if (user.password !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      const token = jwt.sign({ userId: user.username }, 'your-secret-key');
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
// Create a new todo list
app.post('/todo-lists', async (req, res) => {
  try {
    console.log("coming here")
    const { title, userId } = req.body;
    const todoList = new TodoList({ title, userId });
    await todoList.save();
    res.json({ todoList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Todo list creation failed' });
  }
});

// Update a todo list by ID
app.put('/todo-lists/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const todoList = await TodoList.findByIdAndUpdate(req.params.id, { title }, { new: true });

    if (!todoList) {
      return res.status(404).json({ error: 'Todo list not found' });
    }

    res.json({ todoList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Todo list update failed' });
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { content, completed, todoListId } = req.body;
    const task = new Task({ content, completed, todoListId });
    await task.save();
    res.json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Task creation failed' });
  }
});

// Update a task by ID
app.put('/tasks/:id', async (req, res) => {
  try {
    const { content, completed, todoListId } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { content, completed, todoListId }, { new: true });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Task update failed' });
  }
});

// Move a task to a different todo list
app.put('/move-task/:taskId', async (req, res) => {
  try {
    const { newTodoListId } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.taskId, { todoListId: newTodoListId }, { new: true });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Move task failed' });
  }
});

app.get('/lists/:userId', async (req, res) => {
    try {
      const userId = req.params.userId; // Assuming you pass the user's ID in the route parameter
      const lists = await TodoList.find({ userId }); // Adjust this query based on your data model
  
      res.json(lists);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching lists' });
    }
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
