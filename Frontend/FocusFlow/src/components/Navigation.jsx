import {NavLink, Link} from "react-router-dom";

function Navigation(){
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
            <div className = "sideBarBottom">
                <Link to = "/">Log Out</Link>
            </div>
        </aside>
    );
}
export default Navigation;