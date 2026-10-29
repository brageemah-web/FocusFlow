import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const TASKS_KEY = "focusflow_tasks";
const NOTES_KEY = "focusflow_notes";
const POMODORO_KEY = "focusflow_pomodoro";
const CALENDAR_KEY = "focusflow_calendar_events";

function readStorage(key) {
    try {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
        console.error(`Could not load ${key}:`, error);
        return null;
    }
}

function Dashboard() {
    // Load saved tasks
    const [tasks] = useState(() => {
        const savedTasks = readStorage(TASKS_KEY);
        return Array.isArray(savedTasks) ? savedTasks : [];
    });

    // Load saved notes
    const [notes] = useState(() => {
        const savedNotes = readStorage(NOTES_KEY);
        return Array.isArray(savedNotes) ? savedNotes : [];
    });

    // Load Pomodoro settings and completed sessions
    const [pomodoro] = useState(() => readStorage(POMODORO_KEY));

    // Load saved calendar events
    const [events] = useState(() => {
    const savedEvents = readStorage(CALENDAR_KEY);
    return Array.isArray(savedEvents) ? savedEvents : [];
});

    // Check whether a task is completed
    const isCompleted = (task) =>
        task.completed === true || task.isCompleted === true;

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tasks that still need to be completed
    const incompleteTasks = tasks.filter(
        (task) => !isCompleted(task)
    );

    // Get a task's due date
    const getTaskDate = (task) => task.dueDate || task.deadline;

    // Tasks due today
    const todaysTasks = incompleteTasks.filter((task) => {
        const taskDate = getTaskDate(task);

        if (!taskDate) return false;

        const dueDate = new Date(taskDate);

        if (Number.isNaN(dueDate.getTime())) return false;

        dueDate.setHours(0, 0, 0, 0);

        return dueDate.getTime() === today.getTime();
    });

    // Get the date of a task or calendar event
const getDeadlineDate = (item) =>
    item.dueDate ||
    item.deadline ||
    item.date ||
    item.startDate;

// Combine incomplete tasks and calendar events
const upcomingDeadlines = [
    ...incompleteTasks,
    ...events,
]
    .filter((item) => {
        const deadlineDate = getDeadlineDate(item);

        if (!deadlineDate) return false;

        const date = new Date(deadlineDate);

        if (Number.isNaN(date.getTime())) return false;

        date.setHours(0, 0, 0, 0);

        return date >= today;
    })
    .sort(
        (a, b) =>
            new Date(getDeadlineDate(a)) -
            new Date(getDeadlineDate(b))
    );


    // Show the three most recently added notes
    const recentNotes = [...notes]
        .sort((a, b) => {
            const dateA = new Date(
                a.createdAt || a.updatedAt || 0
            ).getTime();

            const dateB = new Date(
                b.createdAt || b.updatedAt || 0
            ).getTime();

            return dateB - dateA;
        })
        .slice(0, 3);

    // Estimate focus time from completed study sessions
    const completedSessions = Number(
        pomodoro?.completedSessions ?? 0
    );

    const studyDuration = Number(
        pomodoro?.durations?.study ?? 25
    );

    const focusMinutes = completedSessions * studyDuration;

    return (
        <div className="dashboard">
            <Navigation />

            <main className="dashboardContent">
                {/* Header */}
                <header className="dashboardHeader">
                    <div>
                        <h1>Welcome</h1>
                        <p>Let's make today productive.</p>
                    </div>
                </header>

                {/* Welcome Section */}
                <section className="welcomeCard">
                    <h2>Welcome to FocusFlow!</h2>
                    <p>
                        Organize your tasks, plan your day, and make
                        time for what matters.
                    </p>
                </section>

                {/* Summary Cards */}
                <section className="summaryCards">
                    <div className="summaryCard">
                        <h3>My Tasks</h3>
                        <p className="summaryNumber">
                            {incompleteTasks.length}
                        </p>
                        <p>Tasks to complete</p>
                    </div>

                    <div className="summaryCard">
                        <h3>Completed Tasks</h3>
                        <p className="summaryNumber">
                            {tasks.filter(isCompleted).length}
                        </p>
                        <p>Tasks finished</p>
                    </div>

                    <div className="summaryCard">
                        <h3>Upcoming Deadlines</h3>
                        <p className="summaryNumber">
                            {upcomingDeadlines.length}
                        </p>
                        <p>Incomplete tasks with due dates</p>
                    </div>

                    <div className="summaryCard">
                        <h3>Focus Time</h3>
                        <p className="summaryNumber">
                            {focusMinutes} min
                        </p>
                        <p>Estimated completed study time</p>
                    </div>
                </section>

                {/* Tasks and Notes */}
                <section className="dashboardSections">
                    <div className="dashboardPanel">
                        <h2>Today's Tasks</h2>

                        <Link to="/tasks">View All</Link>

                        {todaysTasks.length === 0 ? (
                            <p>No incomplete tasks are due today.</p>
                        ) : (
                            <ul>
                                {todaysTasks.slice(0, 5).map((task) => (
                                    <li key={task.id}>
                                        {task.title ||
                                            task.name ||
                                            "Untitled task"}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {todaysTasks.length > 5 && (
                            <p>
                                And {todaysTasks.length - 5} more tasks...
                            </p>
                        )}

                        <Link to="/tasks">
                            <button type="button">+ Add Task</button>
                        </Link>
                    </div>

                    <div className="dashboardPanel">
                        <h2>Quick Notes</h2>

                        <Link to="/notes">View All</Link>

                        {recentNotes.length === 0 ? (
                            <p>
                                No notes yet. Create one to get started.
                            </p>
                        ) : (
                            <ul>
                                {recentNotes.map((note) => (
                                    <li key={note.id}>
                                        <strong>
                                            {note.title || "Untitled note"}
                                        </strong>

                                        {note.content && (
                                            <p>
                                                {note.content.length > 80
                                                    ? `${note.content.slice(0, 80)}...`
                                                    : note.content}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Link to="/notes">
                            <button type="button">+ Create Note</button>
                        </Link>
                    </div>
                </section>

                {/* Quick Access */}
                <section className="dashboardQuickAccess">
                    <h2>Quick Access</h2>

                    <div>
                        <Link to="/pomodoro">Pomodoro Timer</Link>
                        <Link to="/chat">Chat with Friends</Link>
                        <Link to="/calendar">Calendar</Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
