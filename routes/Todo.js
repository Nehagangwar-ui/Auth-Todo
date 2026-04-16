const express = require("express");
const router = express.Router();

const Todo = require("../models/Todo");
const auth = require("../middleware/authMiddleware");

// ✅ Add Todo
router.post("/", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Task text is required" });
    }

    const todo = new Todo({
      userId: req.user.id,
      text,
      completed: false,
      createdAt: new Date()
    });

    await todo.save();
    return res.status(201).json({
      message: "Todo created",
      todo
    });
  } catch (err) {
    console.log("Add Todo Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Get All Todos
router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(todos);
  } catch (err) {
    console.log("Get Todos Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Update Todo (Toggle completed)
router.patch("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (todo.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    return res.json({ message: "Todo updated", todo });
  } catch (err) {
    console.log("Update Todo Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Delete Todo
router.delete("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (todo.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Todo.findByIdAndDelete(req.params.id);
    return res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.log("Delete Todo Error:", err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;