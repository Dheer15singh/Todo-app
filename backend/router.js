const express = require("express");
const router = express.Router();
const supabase = require("./supabaseClient");

// CREATE task
router.post("/tasks", async (req, res) => {
  const { taskName, taskStatus, priority } = req.body;

  console.log("📥 Incoming POST /tasks request:", req.body);

  if (!taskName || !taskStatus) {
    console.warn("🚫 Missing taskName or taskStatus:", req.body);
    return res.status(400).json({ error: "Task name and status are required" });
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ 
        taskname: taskName, 
        taskstatus: taskStatus,
        priority: priority || 'medium' // Default priority if not specified
      }])
      .select();

    if (error) {
      console.error("❌ Insert error:", error);
      return res
        .status(500)
        .json({ error: "Insert failed", details: error.message });
    }

    const newTask = data[0];

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ taskorder: newTask.id })
      .eq("id", newTask.id);

    if (updateError) {
      console.error("⚠️ Supabase update error:", updateError);
      return res.status(500).json({
        error: "Failed to update task order",
        details: updateError.message,
      });
    }

    res.status(201).json({
      id: newTask.id,
      taskName: newTask.taskname,
      taskStatus: newTask.taskstatus,
      taskOrder: newTask.id,
      priority: newTask.priority
    });
  } catch (err) {
    console.error("🔥 Unexpected error while creating task:", err);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});

// GET all tasks
router.get("/tasks", async (req, res) => {
  console.log("📥 Incoming GET /tasks request");

  const { data, error } = await supabase
    .from("tasks")
    .select("id, taskname, taskstatus, taskorder, priority")
    .order("taskorder", { ascending: true });

  if (error) {
    console.error("❌ Error fetching tasks:", error);
    return res
      .status(500)
      .json({ error: "Error fetching tasks", details: error.message });
  }

  console.log("✅ Tasks fetched:", data.length);
  const tasks = data.map((task) => ({
    id: task.id,
    taskName: task.taskname,
    taskStatus: task.taskstatus,
    taskOrder: task.taskorder,
    priority: task.priority
  }));

  res.json(tasks);
});

// GET tasks by status
router.get("/tasks/:status", async (req, res) => {
  const statusVal = req.params.status;
  console.log(`📥 GET /tasks/${statusVal}`);

  if (!["active", "completed"].includes(statusVal)) {
    console.warn("⚠️ Invalid status:", statusVal);
    return res.status(400).send("Invalid status parameter");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("id, taskname, taskstatus, taskorder, priority")
    .eq("taskstatus", statusVal)
    .order("taskorder", { ascending: true });

  if (error) {
    console.error("❌ Error fetching tasks by status:", error);
    return res.status(500).send("Error fetching tasks by status");
  }

  const tasks = data.map((task) => ({
    id: task.id,
    taskName: task.taskname,
    taskStatus: task.taskstatus,
    taskOrder: task.taskorder,
    priority: task.priority
  }));

  console.log(`✅ ${tasks.length} tasks with status '${statusVal}' fetched.`);
  res.json(tasks);
});

// UPDATE task
router.put("/tasks/:id", async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { taskName, taskStatus, priority } = req.body;
  console.log(`📥 PUT /tasks/${taskId} with data:`, req.body);

  const { data, error } = await supabase
    .from("tasks")
    .update({ 
      taskname: taskName, 
      taskstatus: taskStatus,
      priority: priority 
    })
    .eq("id", taskId)
    .select();

  if (error) {
    console.error("❌ Error updating task:", error);
    return res.status(500).send("Error updating task");
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ Task not found:", taskId);
    return res.status(404).send("Task not found");
  }

  const updated = data[0];
  console.log("✅ Task updated:", updated);
  res.send({
    id: updated.id,
    taskName: updated.taskname,
    taskStatus: updated.taskstatus,
    taskOrder: updated.taskorder,
    priority: updated.priority
  });
});

// UPDATE task order
router.put("/tasks/order/:id", async (req, res) => {
  const { tasks } = req.body;
  console.log(`📥 PUT /tasks/order/:id with tasks:`, tasks);

  if (!Array.isArray(tasks)) {
    console.warn("⚠️ Invalid tasks data:", tasks);
    return res.status(400).send("Invalid tasks data");
  }

  try {
    const updates = tasks.map((task) =>
      supabase
        .from("tasks")
        .update({ taskorder: task.taskOrder })
        .eq("id", task.id)
    );
    await Promise.all(updates);

    console.log("✅ Task order updated for", tasks.length, "tasks");
    res.status(200).send("Task order updated");
  } catch (err) {
    console.error("❌ Error updating task order:", err);
    res.status(500).send("Error updating task order");
  }
});

// DELETE task
router.delete("/tasks/:id", async (req, res) => {
  const taskId = parseInt(req.params.id);
  console.log(`📥 DELETE /tasks/${taskId}`);

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .select();

  if (error) {
    console.error("❌ Error deleting task:", error);
    return res.status(500).send("Error deleting task");
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ Task not found for delete:", taskId);
    return res.status(404).send("Task not found");
  }

  console.log("✅ Task deleted:", taskId);
  res.status(200).send("Task deleted");
});

module.exports = router;