import {useState} from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "../api";
import "../styles/pages/Register.css";

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setError([]);

        if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
            setError(["Please complete all fields."]);
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!passwordRegex.test(password)) {
            setError(["Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number and a special character (@$!%*?&)."]);
            return;
        }


        if (password !== confirmPassword) {
            setError(["Passwords do not match."]);
            return;
        }

        try {
            setLoading(true);

            const data = await api("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: fullName.trim(),
                    email: email.trim(),
                    password
                })
            });

            console.log(data.message);
            navigate("/");
        } 
        catch (error) {
            console.error("Registration failed:", error);
            setError([error.message || "Registration failed. Please try again."]);
        }
        finally {
            setLoading(false);
        }
    };

    const criteria = {
        length8 : password.length >=8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number : /[0-9]/.test(password),
        symbols: /[@$!%*?&]/.test(password),
        length12: password.length >= 12
    };

    const getStrength = () =>{
        let score = 0;
        if(criteria.length8) score++; 
        if(criteria.uppercase) score++; 
        if(criteria.lowercase) score++; 
        if(criteria.number) score++; 
        if(criteria.symbols) score++; 
        if(criteria.length12) score++; 
        return score;
    };

    const score = getStrength();
    let segmentFilled = 0;
    if(score === 0) segmentFilled = 0;
    else if(score === 1) segmentFilled = 1;
    else if(score ===2) segmentFilled = 2;
    else if(score ===3) segmentFilled = 3;
    else if(score >=4 && score <= 5) segmentFilled= 4;
    else if(score === 6) segmentFilled = 5;

    const getSegment = () =>{
        if (score <= 1) {
            return {
                label: "Very Weak",
                color: "var(--password-weak)",
                percentage: 20
            };
        }
        if (score === 2) {
            return {
                label: "Weak",
                color: "var(--password-weak)",
                percentage: 40
            };
        }

        if (score === 3) {
            return {
                label: "Fair",
                color: "var(--password-fair)",
                percentage: 60
            };
        }

        if (score === 4) {
            return {
                label: "Good",
                color: "var(--password-good)",
                percentage: 80
            };
        }
        return {
            label: "Strong",
            color: "var(--password-strong)",
            percentage: 100
        }
    };

    const strength = getSegment();

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
                    onChange={(event) => {setFullName(event.target.value);
                        setError([]);
                    }}
                    autoComplete="name"
                        required
                    />

                    <label htmlFor="registerEmail">Email</label><br/>
                    <input type="email"
                        id="registerEmail"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setError([]);
                        }}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="registerPassword">Password</label><br/>
                    <input type={showPassword ? "text" : "password"}
                        id="registerPassword"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError([]);
                        }}
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />

                    <label htmlFor="confirmPassword">Confirm Password</label><br/>
                    <input type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setError([]);
                        }}
                        autoComplete="new-password"
                        required
                    />

 
                        {password && (
                            <div className="passwordStrength">
                                <div className="strengthHeader">
                                    <span className="strength-label">
                                        {strength.label}
                                    </span>

                                    <span className="strength-percentage">
                                        {strength.percentage}%
                                    </span>
                                </div>

                                <div className="strengthSegments">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="segment"
                                            style={{
                                                backgroundColor:
                                                    i < segmentFilled
                                                        ? strength.color
                                                        : "var(--border)",
                                                boxShadow:
                                                    i < segmentFilled
                                                        ? `0 0 8px ${strength.color}`
                                                        : "none"
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                    <label className="showPassword">
                        <input
                            type="checkbox"
                            title = "Show Password"
                            checked={showPassword}
                            onChange={(event) =>
                                setShowPassword(event.target.checked)
                            }
                        />
                        Show passwords
                    </label>

                    {error.map((e, index) => (
                        <p className="formError" key={index}>
                            {e}
                        </p>
                    ))}
                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="registerPrompt">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;