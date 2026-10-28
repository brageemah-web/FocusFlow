import {Link} from "react-router-dom";
import Navigation from "../components/Navigation"

function Dashboard(){
    return(
        <div className = "dashboard">
                <Navigation/>
                <main className = "dashboardContent">
                    {/*Header*/}
                    <header className = "dashboardHeader">
                        <div>
                            <h1>Welcome</h1>
                            <p>Let's make today productive</p>
                        </div>
                    </header>

                    {/*Welcome Section */}
                    <section className = "welcomeCard">
                        <h2>Welcome to FocusFlow!</h2>
                        <p>
                            Organize your tasks, plan your and make time for what matters
                        </p>
                    </section>

                    {/* Summary Cards */}
                <section className="summaryCards">

                    <div className="summaryCard">
                        <h3>My Tasks</h3>
                        <p className="summaryNumber">0</p>
                        <p>Tasks to complete</p>
                    </div>

                    <div className="summaryCard">
                        <h3>Completed</h3>
                        <p className="summaryNumber">0</p>
                        <p>Tasks finished</p>
                    </div>

                    <div className="summaryCard">
                        <h3>Focus Time</h3>
                        <p className="summaryNumber">0 min</p>
                        <p>Time spent focusing</p>
                    </div>

                </section>

                {/* Tasks and Notes */}
                <section className="dashboardSections">

                    <div className="dashboardPanel">
                        <h2>Today's Tasks</h2>
                        <Link to = "/tasks">View All</Link>
                        <p>Your daily tasks will appear here.</p>
                        <button type="button">+ Add Task</button>
                    </div>

                    <div className="dashboardPanel">
                        <h2>Quick Notes</h2>
                        <Link to = "/notes">View All</Link>
                        <p>Keep your important thoughts in one place.</p>
                        <button type="button">+ Create Note</button>
                    </div>

                </section>

                </main>
        </div>
    );
}
export default Dashboard;