
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

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error("Could not save tasks:", error);
        }
    }, [tasks]);

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

        setTaskTitle("");
        setTaskDescription("");
        setTaskDueDate("");
    };

    const toggleTask = (taskId) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const deleteTask = (taskId) => {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId)
        );
    };

    return (
        <>
            <Navigation />

            <main>
                <h1>Tasks</h1>
                <p>Organise your work and keep track of your progress.</p>

                <section>
                    <h2>Add a Task</h2>

                    <form onSubmit={addTask}>
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

                        <button type="submit">Add Task</button>
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
                                        checked={task.completed}
                                        onChange={() => toggleTask(task.id)}
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

                                {task.description && (
                                    <p>{task.description}</p>
                                )}

                                {task.dueDate && (
                                    <p>Due: {task.dueDate}</p>
                                )}

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
