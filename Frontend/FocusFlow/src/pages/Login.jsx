import { useNavigate, Link } from "react-router-dom";
import img from '../assets/loginImg.jpg'; 

function Login(){
    const handleForgetPassword = "";
    const navigate = useNavigate();
    const handleLogin = () => {
        navigate("/dashboard");
    }
    return(
        <div className = "loginPage">
            <div className = "loginImg">
                <img src = {img} alt = "Bunny Studying"/>
            </div>

            <div className = "loginForm">
                <h1>FocusFlow</h1>
                <p>
                    <span>Welcome Back!</span><br/> 
                    Login to your account to continue
                </p>

                <form>
                    <label>Email</label><br/>
                    <input type = "email" placeholder = "johnDoe@gmail.com" /><br/>

                    <label>Password</label><br/>
                    <input type = "password"/><br/>

                    <a href = "#" onClick = {handleForgetPassword}>Forget Password?</a><br/>
                    
                    <button onClick = {handleLogin}>Login</button>
                </form>
                <p>Not a member? <Link to = "/register">Register</Link></p>
            </div>
        </div>
    );
}
export default Login;