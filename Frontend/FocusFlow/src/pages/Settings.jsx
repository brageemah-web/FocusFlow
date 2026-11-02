
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import api from "../api";

function Settings() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
    });

    const [appearance, setAppearance] = useState("light");

    const [notifications, setNotifications] = useState({
        taskReminders: true,
        studyReminders: true,
        friendRequests: true,
    });

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
                email: data.user.email,
            });

            setMessage(data.message);
        } catch (error) {
            setMessage(error.message);
        }
    };

    const toggleNotification = (setting) => {
        setNotifications((current) => ({
            ...current,
            [setting]: !current[setting],
        }));
    };

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api("/auth/me");

                setProfile({
                    name: data.name,
                    email: data.email,
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


    return (
        <>
            <Navigation />

            <main>
                <h1>Settings</h1>
                <p>Manage your FocusFlow preferences.</p>

                <section>
                    <h2>Profile</h2>

                    {loading ? (
                        <p>Loading profile...</p>
                    ) : (
                        <form onSubmit={updateProfile}>
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
                                    onChange={(event) =>
                                        setProfile((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <button type="submit">Save Profile</button>
                        </form>
                    )}

                    {message && <p role="status">{message}</p>}
                </section>

                <section>
                    <h2>Appearance</h2>

                    <label htmlFor="appearance">Theme</label>
                    <select
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
                    <p>
                        Applying the theme across the app can be connected
                        when we implement shared theme state.
                    </p>
                </section>

                <section>
                    <h2>Change Password</h2>

                    <form onSubmit={updatePassword}>
                        <input
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

                        <input
                            type="password"
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={(event) =>
                                setPasswordData({
                                    ...passwordData,
                                    newPassword: event.target.value
                                })
                            }
                            minLength={6}
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
                            minLength={6}
                            required
                        />

                        <button type="submit">Update Password</button>
                    </form>
                </section>

                {message && <p role="status">{message}</p>}

                <section>
                    <h2>Notifications</h2>

                    <label>
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
                </section>
            </main>
        </>
    );
}

export default Settings;
