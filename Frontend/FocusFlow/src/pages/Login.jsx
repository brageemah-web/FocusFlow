import {useState} from "react";
import { useNavigate, Link } from "react-router-dom";


function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

  
    const handleLogin = (event) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        // Temporary navigation until backend authentication is added
        navigate("/dashboard");
    }

    const handleForgetPassword = (event) => {
        event.preventDefault();
        setError("Password recovery will be available soon.");
    };

    return(
        <div className = "loginPage">
            <div className = "loginForm">
                <h1>FocusFlow</h1>
                <p className = "loginWelcome">
                    <span>Welcome Back!</span><br/> 
                    Login to your account to continue
                </p>

                <form>
                    <label htmlFor = "email" >Email</label><br/>
                    <input type = "email" 
                    id = "email" 
                    placeholder = "johnDoe@gmail.com" 
                    value = {email} 
                    onChange = {(event) => setEmail(event.target.value)} 
                    required
                    /><br/>

                    <label htmlFor = "password" >Password</label><br/>
                    <input type = "password" 
                    id = "password" 
                    placeholder = "Enter your password" 
                    value = {password} 
                    onChange = {(event) => setPassword(event.target.value)} 
                    required
                    /><br/>

                    <label className = "showPassword">
                        <input type = "checkbox" 
                        checked = {showPassword} 
                        onChange = {(event) => setShowPassword(event.target.checked)}
                        />
                        Show password
                    </label>

                    <div className = "forgotPassword">
                        <a href = "#" onClick = {handleForgetPassword}>Forget Password?</a><br/>
                    </div>

                    {error && <p className = "formError">{error}</p>}
                    
                    <button onClick = {handleLogin}>Login</button>
                </form>
                <p className = "registerPrompt">Not a member? 
                    <Link to = "/register">Register</Link>
                </p>
            </div>
        </div>
    );
}
export default Login;