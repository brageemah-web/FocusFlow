import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import api from "../api";
import "../styles/pages/Dashboard.css";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [events, setEvents] = useState([]);
    const [sessions, setSessions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [currentStreak] = useState(
        () => Number(localStorage.getItem("currentStreak")) || 0
    );

    const [longestStreak] = useState(
        () => Number(localStorage.getItem("longestStreak")) || 0
    );

    useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const [
                tasksData,
                notesData,
                eventsData,
                sessionsData
            ] = await Promise.all([
                api("/tasks"),
                api("/notes"),
                api("/calendar"),
                api("/pomodoro")
            ]);

            setTasks(tasksData);
            setNotes(notesData);
            setEvents(eventsData);
            setSessions(sessionsData);

        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
}, []);

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
    const completedStudySessions = sessions.filter(
        (session) =>
            session.sessionType === "study" &&
            session.completed
    );


    const focusMinutes = completedStudySessions.reduce(
        (total, session) => total + session.duration,
        0
    );

    return (
        <div className="dashboard">
            <Navigation />
            <main className="dashboardContent">
            {loading ? (
                <p>Loading dashboard...</p>
            ) : message ? (
                <p>{message}</p>
            ) : (
                <>

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

                <section className = "dailyStreak">
                    <div className="streakCard">
                        <h3>Daily Streak 🔥</h3>

                        <p className="summaryNumber">
                            {currentStreak}
                        </p>

                        <p>
                            {currentStreak === 1
                                ? "Day in a row"
                                : "Days in a row"}
                        </p>

                        <p className="longestStreak">
                            🏆 Longest streak: {longestStreak} days
                        </p>
                    </div>
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
                        <p>Tasks and events coming ups</p>
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
                                    <li key={task._id}>
                                        <strong>{task.title}</strong>
                                        <p>Due today</p>
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
                            + Add Task
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
                                    <li key={note._id}>
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
                            + Create Note
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
            </>
            )} 
            </main>
        </div>
    );
}

export default Dashboard;
