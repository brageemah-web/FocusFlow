import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path = "/tasks"/>
                <Route path = "/calendar"/>
                <Route path = "/notes"/>
                <Route path = "/pomodoro"/>
                <Route path = "/friends"/>
                <Route path = "/chat"/>
                <Route path = "/settings"/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;