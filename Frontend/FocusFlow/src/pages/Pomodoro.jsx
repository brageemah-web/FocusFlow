import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { usePomodoro } from "../context/usePomodoro.js";
import api from "../api";

function Pomodoro() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const studyOptions = [15, 25, 30, 45, 60];
    const shortBreakOptions = [5, 10];
    const longBreakOptions = [15, 20];
    
    const {
        durations,
        mode,
        timeLeft,
        isRunning,
        completedSessions,
        soundEnabled,
        setSoundEnabled,
        changeMode,
        changeDuration,
        resetTimer,
        startPauseTimer,
    } = usePomodoro();

    useEffect(() => {
    const fetchSessions = async () => {
        try {
            const data = await api("/pomodoro");

            setSessions(data);
        } catch (error) {
            console.error("Failed to retrieve sessions:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchSessions();
    }, [completedSessions]);

    const renderDurationOptions = (type, options) => {
        return (
            <div className="durationOptions">
                {options.map((minutes) => (
                    <button
                        key={minutes}
                        type="button"
                        className={
                            durations[type] === minutes
                                ? "durationButton active"
                                : "durationButton"
                        }
                        disabled={isRunning}
                        onClick={() => changeDuration(type, minutes)}
                    >
                        {minutes} min
                    </button>
                ))}
            </div>
        );
    };
    const deleteSession = async (sessionId) => {
        try {
            await api(`/pomodoro/${sessionId}`, {
                method: "DELETE",
            });

            setSessions((previousSessions) =>
                previousSessions.filter(
                    (session) => session._id !== sessionId
                )
            );
        } catch (error) {
            console.error("Failed to delete session:", error);
            setMessage(error.message);
        }
    };
    

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const completedStudySessions = sessions.filter(
        (session) => session.sessionType === "study" && session.completed
    ).length;

    return (
        <>
            <Navigation />

            <main className = "pomodoroContent">
                <h1>Pomodoro Timer</h1>
                <p>Stay focused, take breaks, and make progress.</p>

                <section className = "timerMode">
                    <button
                        className={mode === "study" ? "modeButton active" : "modeButton"}
                        type="button"
                        onClick={() => changeMode("study")}
                        disabled={mode === "study"}
                    >
                        Study
                    </button>

                    <button
                        className={mode === "shortBreak" ? "modeButton active" : "modeButton"}
                        type="button"
                        onClick={() => changeMode("shortBreak")}
                        disabled={mode === "shortBreak"}
                    >
                        Short Break
                    </button>

                    <button
                        className={mode === "longBreak" ? "modeButton active" : "modeButton"}
                        type="button"
                        onClick={() => changeMode("longBreak")}
                        disabled={mode === "longBreak"}
                    >
                        Long Break
                    </button>
                </section>

                <section>
                    <h2 className="timerHeading">
                        {mode === "study"
                            ? "Time to focus!"
                            : mode === "shortBreak"
                            ? "Take a short break"
                            : "Take a long break"}
                    </h2>

                    <p
                        className="timerDisplay"
                        role="timer"
                        aria-live="off"
                    >
                        {formatTime(timeLeft)}
                    </p>

                    <button type="button"  className="timerButton" onClick={startPauseTimer}>
                        {isRunning ? "Pause" : "Start"}
                    </button>

                    <button type="button" className="resetButton" onClick={resetTimer}>
                        Reset
                    </button>
                </section>

                <section className="timerSettings">
                    <h2>Timer Settings</h2>
                    <p>Choose your preferred session durations.</p>

                    <div className="durationSetting">
                        <h3>Study Duration</h3>

                        {renderDurationOptions("study", studyOptions)}
                    </div>

                    <div className="durationSetting">
                        <h3>Short Break</h3>

                        {renderDurationOptions("shortBreak", shortBreakOptions)}
                    </div>

                    <div className="durationSetting">
                        <h3>Long Break</h3>

                        {renderDurationOptions("longBreak", longBreakOptions)}
                    </div>

                    <label className="soundSetting">
                        <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) =>
                                setSoundEnabled(e.target.checked)
                            }
                        />
                        Enable timer sound
                    </label>
                </section>

                <section className="sessionProgress">
                    <h2>Session Progress</h2>
                    <p>Completed study sessions: {completedStudySessions}</p>

                    <p>
                        {completedStudySessions > 0
                            ? "Great work! Keep it up."
                            : "Complete a study session to track your progress."}
                    </p>
                </section>

                <section className="sessionHistory">
                    <h2>Session History</h2>

                    {loading ? (
                        <p>Loading sessions...</p>
                        ) : sessions.length === 0 ? (
                            <p>No completed sessions yet.</p>
                        ) : (
                            sessions.map((session) => (
                        <article className="sessionCard" key={session._id}>
                            <p>Duration: {session.duration} minutes</p>
                            <p>Type: {session.sessionType}</p>
                            <p>
                                Date: {new Date(session.createdAt).toLocaleDateString()}
                            </p>

                            <button className="deleteButton"
                                type="button"
                                onClick={() => deleteSession(session._id)}
                            >
                                Delete
                            </button>
                        </article>
                        ))
                    )}

                    {message && <p>{message}</p>}
                </section>
            </main>
        </>
    );
}

export default Pomodoro;
