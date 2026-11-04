import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PomodoroProvider } from "./context/PomodoroContext.jsx";
import { MusicPlayerProvider } from "./context/MusicPlayerContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
            <PomodoroProvider>
                <MusicPlayerProvider>
                    <App />
                </MusicPlayerProvider>
            </PomodoroProvider>
    </StrictMode>
);