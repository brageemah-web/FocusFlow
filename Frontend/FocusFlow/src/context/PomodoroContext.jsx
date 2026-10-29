
import { useState, useEffect, useRef } from "react";
import { PomodoroContext } from "./PomodoroContext.js";

export function PomodoroProvider({ children }) {
    const [durations, setDurations] = useState({
        study: 25,
        shortBreak: 5,
        longBreak: 15,
    });

    const [mode, setMode] = useState("study");
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const audioContextRef = useRef(null);
    const playSoundRef = useRef(null);

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

    useEffect(() => {
        if (!isRunning) return;

        const timer = setInterval(() => {
            setTimeLeft((previousTime) => {
                if (previousTime <= 1) {
                    clearInterval(timer);
                    setIsRunning(false);

                    if (mode === "study") {
                        setCompletedSessions(
                            (sessions) => sessions + 1
                        );
                    }

                    playSoundRef.current?.();

                    return 0;
                }

                return previousTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, mode]);

    const changeMode = (newMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(durations[newMode] * 60);
    };

    const changeDuration = (durationMode, value) => {
        const minutes = Number(value);

        if (
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
        setIsRunning(false);
        setTimeLeft(durations[mode] * 60);
    };

    const startPauseTimer = () => {
        if (timeLeft === 0) {
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
