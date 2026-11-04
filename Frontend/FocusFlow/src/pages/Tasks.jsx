
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import api from "../api";
import "../styles/pages/Tasks.css";


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


    // Clear the form and exit editing mode.
    const clearForm = () => {
        setTaskTitle("");
        setTaskDescription("");
        setTaskDueDate("");
        setEditingTaskId(null);
    };

    
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
        setTaskDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
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

//show overdue tasks
const isOverdue = (task) => {
    if (!task.dueDate || task.completed) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    dueDate.setUTCHours(0, 0, 0, 0);

    return dueDate < today;
};

const completedTasks = tasks.filter(
    (task) => task.completed
).length;

const totalTasks = tasks.length;

const completionPercentage = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);


    useEffect(() => {
        if (totalTasks > 0 && completedTasks === totalTasks) {
            alert("You completed all your tasks 🥳");
        }
    }, [completedTasks, totalTasks]);

    return (
        <>
            <Navigation />

            <main className = "tasksContent">
                <h1>Tasks</h1>
                <p>Organise your work and keep track of your progress.</p>

                <section className = "taskProgress">
                    <h2>Task Progress</h2>

                    <p>
                        {completedTasks} of {totalTasks} tasks completed
                    </p>

                    <h3>{completionPercentage}%</h3>


                    <div
                        className="taskProgressTrack"
                        role="progressbar"
                        aria-valuenow={completionPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="taskProgressFill"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </section>
                
                <section className = "taskFormSection">
                    <h2>
                        {editingTaskId !== null
                            ? "Edit Task"
                            : "Add a Task"}
                    </h2>

                    <form className = "taskForm"
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

                        <div className = "taskFormActions">

                            <button type="submit" className = "primaryButton">
                                {editingTaskId !== null
                                    ? "Save Changes"
                                    : "Add Task"}
                            </button>

                            {editingTaskId !== null && (
                                <button className = "primaryButton"
                                    type="button"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>
                <section className = "taskListSection">
                    <h2>My Tasks ({tasks.length})</h2>

                    {message && <p className = "taskMessage" role="status">{message}</p>}

                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <p>No tasks yet. Add your first task above!</p>
                    ) : (
                        tasks.map((task) => (
                            <article key={task._id}
                            className={`taskCard ${task.completed ? "completed" : ""}`}
                            >
                                <label>
                                    <input
                                        type="checkbox"
                                        title = "Complete Task"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task._id)}
                                    />

                                    <span className = "taskTitleText">
                                        {task.title}
                                        </span>
                                        {isOverdue(task) && (
                                            <span className = "overdueLabel">
                                                Overdue
                                            </span>
                                        )}
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

                                <div className = "taskActions">
                                <button type="button"
                                    className="editButton"
                                    onClick={() => startEditing(task)}>
                                    Edit
                                </button>

                                <button type="button" className = "deleteButton"
                                    onClick={() => deleteTask(task._id)}>
                                    Delete
                                </button>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Tasks;
