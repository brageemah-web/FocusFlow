
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import api from "../api";



function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    

    useEffect(() => {
    const fetchTasks = async () => {
        try {
            const data = await api("/tasks");
            setTasks(data);
        } catch (error) {
            console.error("Failed to retrieve tasks:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchTasks();
}, []);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDueDate, setTaskDueDate] = useState("");

    // Track the task currently being edited.
    const [editingTaskId, setEditingTaskId] = useState(null);


    // Add a new task.
    const addTask = async (event) => {
    event.preventDefault();

    const title = taskTitle.trim();

    if (!title) return;

    try {
        const newTask = await api("/tasks", {
            method: "POST",
            body: JSON.stringify({
                title,
                description: taskDescription.trim(),
                dueDate: taskDueDate || null,
                completed: false,
            }),
        });

        setTasks((currentTasks) => [newTask, ...currentTasks]);

        clearForm();
        setMessage("Task added successfully.");
    } catch (error) {
        console.error("Failed to add task:", error);
        setMessage(error.message);
    }
};

    // Fill the form with the selected task's details.
    const startEditing = (task) => {
        setEditingTaskId(task._id);
        setTaskTitle(task.title || "");
        setTaskDescription(task.description || "");
        setTaskDueDate(task.dueDate || "");
    };

    // Save changes to the existing task.
    const saveTaskChanges = async (event) => {
    event.preventDefault();

    const title = taskTitle.trim();

    if (!title || editingTaskId === null) return;

    const existingTask = tasks.find(
        (task) => task._id === editingTaskId
    );

    if (!existingTask) return;

    try {
        const updatedTask = await api(`/tasks/${editingTaskId}`, {
            method: "PUT",
            body: JSON.stringify({
                title,
                description: taskDescription.trim(),
                dueDate: taskDueDate || null,
                completed: existingTask.completed,
            }),
        });

        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task._id === editingTaskId ? updatedTask : task
            )
        );

        clearForm();
        setMessage("Task updated successfully.");
    } catch (error) {
        console.error("Failed to update task:", error);
        setMessage(error.message);
    }
};

    // Clear the form and exit editing mode.
    const clearForm = () => {
        setTaskTitle("");
        setTaskDescription("");
        setTaskDueDate("");
        setEditingTaskId(null);
    };

    // Mark a task as completed or incomplete.
    const toggleTask = async (taskId) => {
    const task = tasks.find((task) => task._id === taskId);

    if (!task) return;

    try {
        const updatedTask = await api(`/tasks/${taskId}`, {
            method: "PUT",
            body: JSON.stringify({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                completed: !task.completed,
            }),
        });

        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task._id === taskId ? updatedTask : task
            )
        );

        setMessage(
            updatedTask.completed
                ? "Task marked as complete."
                : "Task marked as incomplete."
        );
    } catch (error) {
        console.error("Failed to update task status:", error);
        setMessage(error.message);
    }
};
    // Delete a task.
    const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
        await api(`/tasks/${taskId}`, {
            method: "DELETE",
        });

        setTasks((currentTasks) =>
            currentTasks.filter((task) => task._id !== taskId)
        );

        if (editingTaskId === taskId) {
            clearForm();
        }

        setMessage("Task deleted successfully.");
    } catch (error) {
        console.error("Failed to delete task:", error);
        setMessage(error.message);
    }
};

    return (
        <>
            <Navigation />

            <main>
                <h1>Tasks</h1>
                <p>Organise your work and keep track of your progress.</p>

                <section>
                    <h2>
                        {editingTaskId !== null
                            ? "Edit Task"
                            : "Add a Task"}
                    </h2>

                    <form
                        onSubmit={
                            editingTaskId !== null
                                ? saveTaskChanges
                                : addTask
                        }
                    >
                        <div>
                            <label htmlFor="taskTitle">Task title</label>
                            <input
                                id="taskTitle"
                                type="text"
                                value={taskTitle}
                                onChange={(event) =>
                                    setTaskTitle(event.target.value)
                                }
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="taskDescription">
                                Description
                            </label>
                            <textarea
                                id="taskDescription"
                                value={taskDescription}
                                onChange={(event) =>
                                    setTaskDescription(event.target.value)
                                }
                                placeholder="Add details (optional)"
                            />
                        </div>

                        <div>
                            <label htmlFor="taskDueDate">Due date</label>
                            <input
                                id="taskDueDate"
                                type="date"
                                value={taskDueDate}
                                onChange={(event) =>
                                    setTaskDueDate(event.target.value)
                                }
                            />
                        </div>

                        <button type="submit">
                            {editingTaskId !== null
                                ? "Save Changes"
                                : "Add Task"}
                        </button>

                        {editingTaskId !== null && (
                            <button
                                type="button"
                                onClick={clearForm}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </section>

                <section>
                    <h2>My Tasks ({tasks.length})</h2>

                    {message && <p role="status">{message}</p>}

                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <p>No tasks yet. Add your first task above!</p>
                    ) : (
                        tasks.map((task) => (
                            <article key={task._id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task._id)}
                                    />

                                    <span
                                        style={{
                                            textDecoration: task.completed
                                                ? "line-through"
                                                : "none",
                                        }}
                                    >
                                        {task.title}
                                    </span>
                                </label>

                                {task.description && <p>{task.description}</p>}
                                {task.dueDate && (
                                    <p>
                                        Due: {new Date(task.dueDate).toLocaleDateString("en-ZA", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            timeZone: "UTC",
                                        })}
                                    </p>
                                )}

                                <button type="button"
                                    onClick={() => startEditing(task)}>
                                    Edit
                                </button>

                                <button type="button"
                                    onClick={() => deleteTask(task._id)}>
                                    Delete
                                </button>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Tasks;
