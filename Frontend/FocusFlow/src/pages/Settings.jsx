
import { useState } from "react";
import Navigation from "../components/Navigation";

function Settings() {
    const [profile, setProfile] = useState({
        displayName: "",
        username: "",
    });

    const [appearance, setAppearance] = useState("light");

    const [notifications, setNotifications] = useState({
        taskReminders: true,
        studyReminders: true,
        friendRequests: true,
    });

    const [message, setMessage] = useState("");

    const updateProfile = (event) => {
        event.preventDefault();
        setMessage("Profile settings updated for this session.");
    };

    const toggleNotification = (setting) => {
        setNotifications((current) => ({
            ...current,
            [setting]: !current[setting],
        }));
    };

    return (
        <>
            <Navigation />

            <main>
                <h1>Settings</h1>
                <p>Manage your FocusFlow preferences.</p>

                <section>
                    <h2>Profile</h2>

                    <form onSubmit={updateProfile}>
                        <div>
                            <label htmlFor="displayName">
                                Display name
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={profile.displayName}
                                onChange={(event) =>
                                    setProfile((current) => ({
                                        ...current,
                                        displayName: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={profile.username}
                                onChange={(event) =>
                                    setProfile((current) => ({
                                        ...current,
                                        username: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        <button type="submit">Save Profile</button>
                    </form>

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

                <section>
                    <h2>Account</h2>
                    <button
                        type="button"
                        onClick={() =>
                            setMessage(
                                "Sign-out will be available after authentication is connected."
                            )
                        }
                    >
                        Sign Out
                    </button>
                </section>
            </main>
        </>
    );
}

export default Settings;
