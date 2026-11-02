import {NavLink, useNavigate} from "react-router-dom";
import socket from "../socket";

function Navigation(){
    const navigate = useNavigate();

    const handleLogout = () => {
        // Disconnect the user's Socket.IO connection
        socket.disconnect();

        // Remove authentication details
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        // Redirect to Login
        navigate("/");
    };

    return(
        <aside className = "sideBar">
            <h2>FocusFlow</h2>
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
            <div className="sideBarBottom">
                <button onClick={handleLogout}>
                    Log Out
                </button>
            </div>
        </aside>
    );
}
export default Navigation;