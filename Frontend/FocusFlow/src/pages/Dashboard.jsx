import {Link} from "react-router-dom";
import Navigation from "../components/Navigation"

function Dashboard(){
    return(
        <div className = "dashboard">
            <Navigation/>
            {/*nav displayed on the left for all pages*/}

            <div className = "search">
                <inut type = "text" placeholder = "Search anything..."/>
                {/*notifications */}
                <div className = "profile">
                    <img src = "" alt = "Profile Pic"/>
                    {/*name */}
                </div>

                <h3>Welcome! name</h3>
            </div>

            <div className = "widgets">
                <div className = "tasks">

                </div>

                <div className = "deadlines">

                </div>

                <div className = "focusTime">

                </div>

                <div className = "streak">

                </div>
            </div>

            <div className = "tasksWidget">
                <Link to = "">View all</Link>

            </div>

            <div className = "deadlinesWidget">
                <Link to = "">View all</Link>
            </div>


        </div>
    );
}
export default Dashboard;