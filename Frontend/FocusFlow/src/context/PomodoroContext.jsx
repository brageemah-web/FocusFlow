
import { useState, useEffect, useRef } from "react";
import { PomodoroContext } from "./PomodoroContext.js";
import api from "../api";

const STORAGE_KEY = "focusflow_pomodoro";

const DEFAULT_SETTINGS = {
    durations: {
        study: 25,
        shortBreak: 5,
        longBreak: 15,
    },
    completedSessions: 0,
    soundEnabled: true,
};

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(STORAGE_KEY);

        if (!savedSettings) {
            return DEFAULT_SETTINGS;
        }

        const parsed = JSON.parse(savedSettings);

        const savedDurations = parsed.durations ?? {};

        const getDuration = (key, fallback) => {
            const value = savedDurations[key];

            return Number.isInteger(value) &&
                value >= 1 &&
                value <= 180
                ? value
                : fallback;
        };

        return {
            durations: {
                study: getDuration("study", 25),
                shortBreak: getDuration("shortBreak", 5),
                longBreak: getDuration("longBreak", 15),
            },
            completedSessions:
                Number.isInteger(parsed.completedSessions) &&
                parsed.completedSessions >= 0
                    ? parsed.completedSessions
                    : 0,
            soundEnabled:
                typeof parsed.soundEnabled === "boolean"
                    ? parsed.soundEnabled
                    : true,
        };
    } catch (error) {
        console.error("Could not load Pomodoro settings:", error);
        return DEFAULT_SETTINGS;
    }
}

export function PomodoroProvider({ children }) {
    const [initialSettings] = useState(loadSettings);

    const [durations, setDurations] = useState(
        initialSettings.durations
    );

    const [mode, setMode] = useState("study");
    const [timeLeft, setTimeLeft] = useState(
        initialSettings.durations.study * 60
    );
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(
        initialSettings.completedSessions
    );
    const [soundEnabled, setSoundEnabled] = useState(
        initialSettings.soundEnabled
    );

    const audioContextRef = useRef(null);
    const playSoundRef = useRef(null);

    // Save settings and completed sessions
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    durations,
                    completedSessions,
                    soundEnabled,
                })
            );
        } catch (error) {
            console.error("Could not save Pomodoro settings:", error);
        }
    }, [durations, completedSessions, soundEnabled]);

    const playSound = async () => {
        if (!soundEnabled) return;

        try {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return;

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContextClass();
            }

            const audioContext = audioContextRef.current;

            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 1
            );

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.error("Could not play timer sound:", error);
        }
    };

    useEffect(() => {
        playSoundRef.current = playSound;
    });

   
    const completionHandledRef = useRef(false);

    useEffect(() => {
        if (!isRunning) return;

        const timer = setInterval(() => {
            setTimeLeft((previousTime) => {
                if (previousTime <= 1) {
                    clearInterval(timer);
                    setIsRunning(false);

                    if (!completionHandledRef.current) {
                        completionHandledRef.current = true;

                        if (mode === "study") {
                            setCompletedSessions(
                                (sessions) => sessions + 1
                            );

                            const saveSession = async () => {
                                try {
                                    const savedSession = await api("/pomodoro", {
                                        method: "POST",
                                        body: JSON.stringify({
                                            duration: durations.study,
                                            breakDuration: durations.shortBreak,
                                            sessionType: "study",
                                            completed: true
                                        })
                                    });

                                    console.log(
                                        "Pomodoro session saved:",
                                        savedSession
                                    );

                                } catch (error) {
                                    console.error(
                                        "Failed to save Pomodoro session:",
                                        error
                                    );
                                }
                            };

                            saveSession();
                        }

    playSoundRef.current?.();
}

                    return 0;
                }

                return previousTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, mode, durations]);


    const changeMode = (newMode) => {
        if (!Object.hasOwn(durations, newMode)) return;

        completionHandledRef.current = false;
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(durations[newMode] * 60);
    };

    const changeDuration = (durationMode, value) => {
        const minutes = Number(value);

        if (
            !Object.hasOwn(durations, durationMode) ||
            !Number.isInteger(minutes) ||
            minutes < 1 ||
            minutes > 180
        ) {
            return;
        }

        setDurations((current) => ({
            ...current,
            [durationMode]: minutes,
        }));

        if (mode === durationMode && !isRunning) {
            setTimeLeft(minutes * 60);
        }
    };

    const resetTimer = () => {
        completionHandledRef.current = false;
        setIsRunning(false);
        setTimeLeft(durations[mode] * 60);
    };

    const startPauseTimer = () => {
        if (timeLeft === 0) {
            completionHandledRef.current = false;
            setTimeLeft(durations[mode] * 60);
            return;
        }

        setIsRunning((running) => !running);
    };

    return (
        <PomodoroContext.Provider
            value={{
                durations,
                mode,
                timeLeft,
                isRunning,
                completedSessions,
                soundEnabled,
                setSoundEnabled,
                setTimeLeft,
                setIsRunning,
                changeMode,
                changeDuration,
                resetTimer,
                startPauseTimer,
            }}
        >
            {children}
        </PomodoroContext.Provider>
    );
}
