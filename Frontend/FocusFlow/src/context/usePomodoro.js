import { useContext } from "react";
import { PomodoroContext } from "./PomodoroContext";


export function usePomodoro() {
    const context = useContext(PomodoroContext);

    if (!context) {
        throw new Error(
            "usePomodoro must be used inside PomodoroProvider"
        );
    }

    return context;
}