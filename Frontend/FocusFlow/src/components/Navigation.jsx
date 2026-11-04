import {NavLink} from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/components/Navigation.css"

function Navigation(){
    const [open, setOpen] = useState(false);


    // Close on Escape and lock page scroll while open
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = open ? "hidden" : "";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open]);

    return(
        <>
            <header className="mobileTopBar">
                    <button
                        className="menuButton"
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={open}
                        aria-controls="sidebar"
                    >
                        ☰
                    </button>
                    <span className="mobileLogo">FocusFlow</span>
                </header>
                <div
                    className={`navOverlay ${open ? "show" : ""}`}
                    onClick={() => setOpen(false)}
                />

            <aside id="sidebar"  className={`sideBar ${open ? "open" : ""}`}>
                <h2><NavLink to="/dashboard" onClick={() => setOpen(false)}>FocusFlow</NavLink></h2>
                <nav>
                    <NavLink to ="/dashboard">Dashboard</NavLink>
                    <NavLink to = "/tasks">Tasks</NavLink>
                    <NavLink to = "/calendar">Calendar</NavLink>
                    <NavLink to = "/notes">Notes</NavLink>
                    <NavLink to = "/pomodoro">Pomodoro</NavLink>
                    <NavLink to = "/friends">Friends</NavLink>
                    <NavLink to = "/chat">Chat</NavLink>
                    <NavLink to = "/settings">Settings</NavLink>
                </nav>
            </aside>
        </>
    );
}
export default Navigation;