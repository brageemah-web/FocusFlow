import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const data = await api(`/auth/reset-password/${token}`, {
                method: "POST",
                body: JSON.stringify({ newPassword })
            });

            setMessage(data.message);

            setTimeout(() => {
                navigate("/");
            }, 2000);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resetPasswordPage">
            <div className="resetPasswordForm">
                <h1>Reset Password</h1>

                <p>Enter your new password below.</p>

                <form className="resetPasswordFields" onSubmit={handleSubmit}>
                    <label htmlFor="newPassword">New Password</label>

                    <input
                        type="password"
                        id="newPassword"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                    />

                    <label htmlFor="confirmPassword">Confirm Password</label>

                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                    />

                    {error && <p className="formError">{error}</p>}

                    {message && (
                        <p className="resetPasswordMessage" role="status">
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <Link className="resetPasswordLink" to="/">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default ResetPassword;