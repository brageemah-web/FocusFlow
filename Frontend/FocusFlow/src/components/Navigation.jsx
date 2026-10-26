import {NavLink} from "react-router-dom";

function Navigation(){
    return(
        <nav>
            <NavLink to ="/dashboard"> Home</NavLink>
            <NavLink to = "/tasks">Tasks</NavLink>
            <NavLink to = "/calendar">Calendar</NavLink>
            <NavLink to = "/notes">Notes</NavLink>
            <NavLink to = "/pomodoro">Pomodoro</NavLink>
            <NavLink to = "/friends">Friends</NavLink>
            <NavLink to = "/chat">Chat</NavLink>
            <NavLink to = "/settings">Settings</NavLink>
        </nav>
    );
}
export default Navigation;