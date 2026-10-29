import {useState} from "react";
import Navigation from "../components/Navigation";

function Tasks(){
    const [task, setTask] = useState("");
    const [tasks,setTasks] = useState([]);

    const addTask = (e) => {
        e.preventDefault();

        if(task.trim() === ""){
            return;
        }

        const newTask = {
            id: Date.now(),
            title : task.trim(),
            completed: false
        };

        setTasks([...tasks,newTask]);
        setTask("");
    };

    const toggleTask = (id) => {
        setTasks(
            tasks.map((task) => {
                task.id === id ? {...task, completed: !task.completed} : task
            })
        );
    };

    const deleteTask = (id) => {
        setTasks((currentTasks) =>{
            return currentTasks.filter((task) => task.id !== id)
        });
    };

    return(
       <div className = "tasks">
            <Navigation/>

            <main className = "taskContent">
                <header>
                    <h1>My Tasks</h1>
                </header>

                {/*Add task form */}
                <section>
                    <h2>Add a Task</h2>

                    <form onSubmit = {addTask}>
                        <input type = "text" 
                        placeholder="Enter a task..." 
                        value = {task}
                        onChange = {(e) => setTask(e.target.value)}
                        />

                        <button type = "submit">Add Task</button>
                    </form>
                </section>

                {/*Task List */}
                <section>
                    <h2>All Tasks</h2>

                    {tasks.length === 0?(
                        <p>You haven't added any tasks yet.</p>) : (
                            <ul>
                                {tasks.map((task) => (
                                    <li key = {task.id}>
                                        <input type = "checkbox"
                                        checked = {task.completed}
                                        onChange = {() => toggleTask(task.id)}
                                        id= {`task-${task.id}`}
                                        />

                                        <label 
                                            htmlFor = {`task-${task.id}`}
                                            className = {
                                                task.completed ? "taskCompleted":""
                                            }
                                        >
                                            {task.title}
                                        </label>

                                        <button type = "button" onClick = {()=> deleteTask(task.id)}>
                                            Delete
                                        </button>
                                    </li>


                                ))}
                            </ul>
                        )}
                   
                        
                </section>
            </main>
       </div>
    );
}
export default Tasks;