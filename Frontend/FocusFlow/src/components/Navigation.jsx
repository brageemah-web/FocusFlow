import {Link} from "react-router-dom";

function Navigation(){
    return(
        <div className = "navigation">
            <h4>FocusFlow</h4>
            <ul>
                <li><Link to ="/dashboard"> Home</Link></li>
                <li><Link to = "/tasks">Tasks</Link></li>
                <li>Calendar</li>
                <li>Notes</li>
                <li>Pomodoro</li>
                <li>Friends</li>
                <li>Chat</li>
                <li>Settings</li>
                <li>Logout</li>
            </ul>
            
        </div>
    );
}
export default Navigation;