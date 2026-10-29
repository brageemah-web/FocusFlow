import Navigation from "../components/Navigation";
import { usePomodoro } from "../context/usePomodoro.js";

function Pomodoro() {
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

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    return (
        <>
            <Navigation />

            <main>
                <h1>Pomodoro Timer</h1>
                <p>Stay focused, take breaks, and make progress.</p>

                <section>
                    <button
                        type="button"
                        onClick={() => changeMode("study")}
                        disabled={mode === "study"}
                    >
                        Study
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMode("shortBreak")}
                        disabled={mode === "shortBreak"}
                    >
                        Short Break
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMode("longBreak")}
                        disabled={mode === "longBreak"}
                    >
                        Long Break
                    </button>
                </section>

                <section>
                    <h2>
                        {mode === "study"
                            ? "Time to focus!"
                            : mode === "shortBreak"
                            ? "Take a short break"
                            : "Take a long break"}
                    </h2>

                    <p
                        style={{
                            fontSize: "64px",
                            fontWeight: "bold",
                            margin: "20px 0",
                        }}
                        role="timer"
                        aria-live="off"
                    >
                        {formatTime(timeLeft)}
                    </p>

                    <button type="button" onClick={startPauseTimer}>
                        {isRunning ? "Pause" : "Start"}
                    </button>

                    <button type="button" onClick={resetTimer}>
                        Reset
                    </button>
                </section>

                <section>
                    <h2>Timer Settings</h2>
                    <p>Choose a duration between 1 and 180 minutes.</p>

                    <div>
                        <label htmlFor="studyDuration">
                            Study duration (minutes)
                        </label>
                        <input
                            id="studyDuration"
                            type="number"
                            min="1"
                            max="180"
                            value={durations.study}
                            disabled={isRunning}
                            onChange={(e) =>
                                changeDuration("study", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="shortBreakDuration">
                            Short break (minutes)
                        </label>
                        <input
                            id="shortBreakDuration"
                            type="number"
                            min="1"
                            max="180"
                            value={durations.shortBreak}
                            disabled={isRunning}
                            onChange={(e) =>
                                changeDuration("shortBreak", e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="longBreakDuration">
                            Long break (minutes)
                        </label>
                        <input
                            id="longBreakDuration"
                            type="number"
                            min="1"
                            max="180"
                            value={durations.longBreak}
                            disabled={isRunning}
                            onChange={(e) =>
                                changeDuration("longBreak", e.target.value)
                            }
                        />
                    </div>

                    <label>
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

                <section>
                    <h2>Session Progress</h2>
                    <p>Completed study sessions: {completedSessions}</p>

                    <p>
                        {completedSessions > 0
                            ? "Great work! Keep it up."
                            : "Complete a study session to track your progress."}
                    </p>
                </section>
            </main>
        </>
    );
}

export default Pomodoro;
