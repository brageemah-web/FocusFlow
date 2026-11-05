
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import api from "../api";
import {useNavigate} from "react-router-dom";
import socket from "../socket";
import "../styles/pages/Settings.css";

function Settings() {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");


    const [profile, setProfile] = useState({
        name: "",
        email: ""
    });
    const [appearance, setAppearance] = useState(() => {
        return localStorage.getItem("appearance") || "light";
    });

   /* const [notifications, setNotifications] = useState({
        taskReminders: true,
        studyReminders: true,
        friendRequests: true,
    });*/

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");

    const updateProfile = async (event) => {
        event.preventDefault();

        try {
            const data = await api("/auth/me", {
                method: "PUT",
                body: JSON.stringify(profile),
            });

            setProfile({
                name: data.user.name,
                email: data.user.email
            });

            setMessage(data.message);
        } catch (error) {
            setMessage(error.message);
        }
    };

    /*const toggleNotification = (setting) => {
        setNotifications((current) => ({
            ...current,
            [setting]: !current[setting],
        }));
    };*/

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api("/auth/me");
                const user = data.user || data;

                setProfile({
                    name: user.name || "",
                    email: user.email || "",
                });
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const updatePassword = async (event) => {
        event.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage("New passwords do not match.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!passwordRegex.test(passwordData.newPassword)) {
            setMessage("Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number and a special character (@$!%*?&).");
            return;
        }

        try {
            const data = await api("/auth/change-password", {
                method: "PUT",
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            setMessage(data.message);

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error) {
            setMessage(error.message);
        }
    };

    useEffect(() => {
        const applyTheme = () => {
            let theme = appearance;

            if (appearance === "system") {
                theme = window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
            }

            document.documentElement.setAttribute("data-theme", theme);
        };

        localStorage.setItem("appearance", appearance);

        applyTheme();

        if (appearance === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

            mediaQuery.addEventListener("change", applyTheme);

            return () => {
                mediaQuery.removeEventListener("change", applyTheme);
            };
        }
    }, [appearance]);


    const navigate = useNavigate();

    const handleLogout = () => {
        // Disconnect the user's Socket.IO connection
        socket.disconnect();

        // Remove authentication details
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        // Redirect to Login
        navigate("/");
    };

    const handleDeleteAccount = async (event) => {
        event.preventDefault();

        if (!deletePassword) {
            setDeleteMessage("Please enter your current password.");
            return;
        }

        try {
            setDeleting(true);
            setDeleteMessage("");

            await api("/auth/me", {
                method: "DELETE",
                body: JSON.stringify({
                    password: deletePassword
                })
            });

            // Disconnect Socket.IO
            socket.disconnect();

            // Remove authentication details
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("appearance");

            // Redirect to Login
            navigate("/");

        } catch (error) {
            console.error("Account deletion failed:", error);
            setDeleteMessage(error.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Navigation />

            <main className="settingsContent">
                <h1>Settings</h1>
                <p>Manage your FocusFlow preferences.</p>

                <section className="settingsSection profileSection">
                    <h2>Profile</h2>

                    {loading ? (
                        <p>Loading profile...</p>
                    ) : (
                        <form className="settingsForm" onSubmit={updateProfile}>
                            <div>
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={profile.name}
                                    onChange={(event) =>
                                        setProfile((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                />
                            </div>

                            <button type="submit">Save Profile</button>
                        </form>
                    )}
                </section>

                <section className="settingsSection appearanceSection">
                    <h2>Appearance</h2>

                    <label htmlFor="appearance">Theme</label>
                    <select className="themeSelect"
                        id="appearance"
                        value={appearance}
                        onChange={(event) =>
                            setAppearance(event.target.value)
                        }
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System default</option>
                    </select>

                    <p>Selected theme: {appearance}</p>
                </section>

                <section className="settingsSection passwordSection">
                    <h2>Change Password</h2>

                    <form className="settingsForm" onSubmit={updatePassword}>
                        <input className="passwordInput"
                            type="password"
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={(event) =>
                                setPasswordData({
                                    ...passwordData,
                                    currentPassword: event.target.value
                                })
                            }
                            required
                        />

                        <input className="passwordInput"
                            type="password"
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={(event) =>
                                setPasswordData({
                                    ...passwordData,
                                    newPassword: event.target.value
                                })
                            }
                            minLength={8}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={passwordData.confirmPassword}
                            onChange={(event) =>
                                setPasswordData({
                                    ...passwordData,
                                    confirmPassword: event.target.value
                                })
                            }
                            minLength={8}
                            required
                        />

                        <button className="updatePasswordButton" type="submit">
                             Update Password
                        </button>
                    </form>
                </section>

                {message && <p role="status">{message}</p>}

               {/* <section className="settingsSection notificationSection">
                    <h2>Notifications</h2>

                    <label className="notificationOption">
                        <input
                            type="checkbox"
                            checked={notifications.taskReminders}
                            onChange={() =>
                                toggleNotification("taskReminders")
                            }
                        />
                        Task reminders
                    </label>

                    <br />

                    <label>
                        <input
                            type="checkbox"
                            checked={notifications.studyReminders}
                            onChange={() =>
                                toggleNotification("studyReminders")
                            }
                        />
                        Study reminders
                    </label>

                    <br />

                    <label>
                        <input
                            type="checkbox"
                            checked={notifications.friendRequests}
                            onChange={() =>
                                toggleNotification("friendRequests")
                            }
                        />
                        Friend request notifications
                    </label>
                </section>}*/}

                <div className="settingSection logoutSection">
                    <button type = "button" className = "logoutButton" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>

                <section className="settingsSection dangerZone">
                    <h2>Danger Zone</h2>

                    <p>
                        Deleting your account is permanent. Your account and
                        associated data may be permanently deleted.
                    </p>

                    {!showDeleteConfirmation ? (
                        <button
                            type="button"
                            className="deleteAccountButton"
                            onClick={() => setShowDeleteConfirmation(true)}
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="deleteConfirmation">
                            <h3>Are you sure?</h3>

                            <p>
                                This action cannot be undone. Enter your current
                                password to confirm account deletion.
                            </p>

                            <form onSubmit={handleDeleteAccount}>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={deletePassword}
                                    onChange={(event) =>
                                        setDeletePassword(event.target.value)
                                    }
                                    required
                                />

                                <div className="deleteActions">
                                    <button
                                        type="submit"
                                        className="confirmDeleteButton"
                                        disabled={deleting}
                                    >
                                        {deleting ? "Deleting..." : "Permanently Delete"}
                                    </button>

                                    <button
                                        type="button"
                                        className="cancelDeleteButton"
                                        onClick={() => {
                                            setShowDeleteConfirmation(false);
                                            setDeletePassword("");
                                            setDeleteMessage("");
                                        }}
                                        disabled={deleting}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>

                            {deleteMessage && (
                                <p role="alert" className="deleteError">
                                    {deleteMessage}
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

export default Settings;
