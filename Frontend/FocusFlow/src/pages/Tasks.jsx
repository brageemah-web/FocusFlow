
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

const STORAGE_KEY = "focusflow_tasks";

function Tasks() {
    const [tasks, setTasks] = useState(() => {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY);
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error("Could not load tasks:", error);
            return [];
        }
    });

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDueDate, setTaskDueDate] = useState("");

    // Track the task currently being edited.
    const [editingTaskId, setEditingTaskId] = useState(null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error("Could not save tasks:", error);
        }
    }, [tasks]);

    // Add a new task.
    const addTask = (event) => {
        event.preventDefault();

        const title = taskTitle.trim();

        if (!title) return;

        const newTask = {
            id: crypto.randomUUID(),
            title,
            description: taskDescription.trim(),
            dueDate: taskDueDate,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        setTasks((currentTasks) => [...currentTasks, newTask]);

        clearForm();
    };

    // Fill the form with the selected task's details.
    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setTaskTitle(task.title || "");
        setTaskDescription(task.description || "");
        setTaskDueDate(task.dueDate || "");
    };

    // Save changes to the existing task.
    const saveTaskChanges = (event) => {
        event.preventDefault();

        const title = taskTitle.trim();

        if (!title || editingTaskId === null) return;

        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === editingTaskId
                    ? {
                          ...task,
                          title,
                          description: taskDescription.trim(),
                          dueDate: taskDueDate,
                          updatedAt: new Date().toISOString(),
                      }
                    : task
            )
        );

        clearForm();
    };

    // Clear the form and exit editing mode.
    const clearForm = () => {
        setTaskTitle("");
        setTaskDescription("");
        setTaskDueDate("");
        setEditingTaskId(null);
    };

    // Mark a task as completed or incomplete.
    const toggleTask = (taskId) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    // Delete a task.
    const deleteTask = (taskId) => {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId)
        );

        if (editingTaskId === taskId) {
            clearForm();
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

                    {tasks.length === 0 ? (
                        <p>No tasks yet. Add your first task above!</p>
                    ) : (
                        tasks.map((task) => (
                            <article key={task.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={
                                            task.completed === true ||
                                            task.isCompleted === true
                                        }
                                        onChange={() => toggleTask(task.id)}
                                    />

                                    <span
                                        style={{
                                            textDecoration:
                                                task.completed ||
                                                task.isCompleted
                                                    ? "line-through"
                                                    : "none",
                                        }}
                                    >
                                        {task.title}
                                    </span>
                                </label>

                                {task.description && (
                                    <p>{task.description}</p>
                                )}

                                {task.dueDate && (
                                    <p>Due: {task.dueDate}</p>
                                )}

                                <button
                                    type="button"
                                    onClick={() => startEditing(task)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => deleteTask(task.id)}
                                >
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
