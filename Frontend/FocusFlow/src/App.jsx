import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Notes from "./pages/Notes";
import Pomodoro from "./pages/Pomodoro";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path = "/tasks" element = {<Tasks/>}/>
                <Route path = "/calendar" element = {<Calendar/>}/>
                <Route path = "/notes" element = {<Notes/>}/>
                <Route path = "/pomodoro" element = {<Pomodoro/>}/>
                <Route path = "/friends" element = {<Friends/>}/>
                <Route path = "/chat" element = {<Chat/>}/>
                <Route path = "/settings" element = {<Settings/>}/>
            </Routes>
        </BrowserRouter>
    );
}



export default App;