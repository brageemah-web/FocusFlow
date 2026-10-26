import {useState} from "react";
import { useNavigate,Link } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = (event) => {
        event.preventDefault();
        setError("");
 
        if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please complete all fields.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Temporary navigation until backend registration is implemented
        navigate("/");
    };

    return (
        <div className="loginPage">
            <div className="loginForm">
                <h1>FocusFlow</h1>

                <p className="loginWelcome">
                    <span>Create Your Account</span>
                    <br />
                    Get started with your productivity journey.
                </p>

                <form onSubmit={handleRegister}>
                    <label htmlFor="fullName">Full Name</label><br/>
                    <input type="text" 
                    id ="fullName" 
                    placeholder="Enter your full name" 
                    value={fullName} 
                    onChange={(event) => setFullName(event.target.value)} 
                    autoComplete="name"
                        required
                    /><br/>

                    <label htmlFor="registerEmail">Email</label><br/>
                    <input type="email"
                        id="registerEmail"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    /><br/>

                    <label htmlFor="registerPassword">Password</label><br/>
                    <input type={showPassword ? "text" : "password"}
                        id="registerPassword"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        minLength={8}
                        required
                    /><br/>

                    <label htmlFor="confirmPassword">Confirm Password</label><br/>
                    <input type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                    /><br/>

                    <label className="showPassword"><br/>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(event) =>
                                setShowPassword(event.target.checked)
                            }
                        />
                        Show passwords
                    </label><br/>

                    {error && <p className="formError">{error}</p>}

                    <button type="submit">Create Account</button>
                </form>

                <p className="registerPrompt">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;