import { useNavigate,Link } from "react-router-dom";


function Register(){
    const navigate = useNavigate();
    const handleLogin = () => navigate("/");
    return(
        <div className = "registerPage">
            <div className = "registerForm">
                <h1>FocusFlow</h1>
                <p>
                    <span>Create your account</span><br/> 
                    Start your journey to a more productive you
                </p> 
                    
                <form>
                    <label>First Name</label><br/>
                    <input type = "text" placeholder = "John"/><br/>

                    <label>Last Name</label><br/>
                    <input type = "text" placeholder = "Doe"/><br/>

                    <label>Email</label><br/>
                    <input type = "email" placeholder = "johnDoe@gmail.com"/><br/>

                    <label>Password</label><br/>
                    <input type = "password"/><br/>

                    <label>Confirm Password</label><br/>
                    <input type = "password"/><br/>

                    <button onClick = {handleLogin}>Register</button><br/>
                </form>   
                <p>Already a member? <Link to = "/">Login</Link></p>
            </div>
        </div>
        
    );
}
export default Register;