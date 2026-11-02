import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const data = await api("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email })
            });

            setMessage(data.message);

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>Forgot Password?</h1>

            <p>
                Enter your registered email address and we'll send
                you a password reset link.
            </p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address</label>

                <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            {message && <p role="status">{message}</p>}

            <Link to="/">Back to Login</Link>
        </main>
    );
}

export default ForgotPassword;