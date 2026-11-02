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
        <main className="forgotPasswordPage">
    <div className="forgotPasswordCard">
        <h1>Forgot Password?</h1>

        <p className="forgotPasswordDescription">
            Enter your registered email address and we'll send
            you a password reset link.
        </p>

        <form className="forgotPasswordForm" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email Address</label>

                <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
            </button>
        </form>

        {message && (
            <p className="forgotPasswordMessage" role="status">
                {message}
            </p>
        )}

        <Link className="backToLogin" to="/">
            Back to Login
        </Link>
    </div>
</main>
    );
}

export default ForgotPassword;